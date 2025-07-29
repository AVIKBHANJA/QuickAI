import express from "express";
import { Liveblocks } from "@liveblocks/node";
import { auth } from "../middlewares/auth.js";

const liveblocksRouter = express.Router();

// Check if Liveblocks secret key is configured
const liveblocksSecretKey = process.env.LIVEBLOCKS_SECRET_KEY;

if (
  !liveblocksSecretKey ||
  liveblocksSecretKey === "your_liveblocks_secret_key_here" ||
  !liveblocksSecretKey.startsWith("sk_")
) {
  console.error("❌ Liveblocks configuration error:");
  console.error("Please set a valid LIVEBLOCKS_SECRET_KEY in your .env file");
  console.error(
    'The secret key must start with "sk_" and can be found at: https://liveblocks.io/dashboard/apikeys'
  );
}

// Initialize Liveblocks with your secret key (only if valid)
let liveblocks = null;
if (liveblocksSecretKey && liveblocksSecretKey.startsWith("sk_")) {
  try {
    liveblocks = new Liveblocks({
      secret: liveblocksSecretKey,
    });
    console.log("✅ Liveblocks initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Liveblocks:", error.message);
  }
}

// Middleware to check if Liveblocks is configured
const checkLiveblocksConfig = (req, res, next) => {
  if (!liveblocks) {
    return res.status(500).json({
      error: "Liveblocks not configured",
      message:
        "Please configure LIVEBLOCKS_SECRET_KEY in your environment variables",
    });
  }
  next();
};

// Authentication endpoint for Liveblocks
liveblocksRouter.post(
  "/auth",
  auth,
  checkLiveblocksConfig,
  async (req, res) => {
    try {
      const { userId } = req.user; // From Clerk authentication
      const { room } = req.body; // Room ID from client

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!room) {
        return res.status(400).json({ error: "Room ID is required" });
      }

      // Create a session for the user
      const session = liveblocks.prepareSession(userId, {
        userInfo: {
          name: req.user.firstName || req.user.emailAddress || `User ${userId}`,
          avatar:
            req.user.imageUrl ||
            `https://api.dicebear.com/6.x/initials/svg?seed=${userId}`,
        },
      });

      // Define room access control logic
      // Updated to work with sanitized room IDs
      
      // For sanitized room IDs, we need different logic:
      // - Shared rooms start with "shared-"
      // - Private rooms contain the user ID (first part before first dash)
      
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().substring(0, 15);
      
      if (room.startsWith("shared-")) {
        // Shared room - full access for all authenticated users
        session.allow(room, session.FULL_ACCESS);
      } else if (room.startsWith(sanitizedUserId)) {
        // User owns this room - full access
        session.allow(room, session.FULL_ACCESS);
      } else {
        // Check if user has been invited to this specific room
        // This is where you'd check your database for room permissions
        const hasAccess = await checkRoomAccess(userId, room);

        if (hasAccess) {
          session.allow(room, session.FULL_ACCESS);
        } else {
          // No access to this room
          return res.status(403).json({ error: "Access denied to this room" });
        }
      }

      // Generate the access token
      const { status, body } = await session.authorize();

      return res.status(status).json(body);
    } catch (error) {
      console.error("Liveblocks auth error:", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  }
);

// Helper function to check room access (implement based on your needs)
async function checkRoomAccess(userId, roomId) {
  // TODO: Implement your room access logic here
  // This could involve checking a database for:
  // - Room memberships
  // - Shared room permissions
  // - Organization/team access

  // For now, return false (no access) for unknown rooms
  // You should replace this with your actual permission logic
  return false;
}

// Endpoint to create a new room with specific permissions
liveblocksRouter.post(
  "/create-room",
  auth,
  checkLiveblocksConfig,
  async (req, res) => {
    try {
      const { userId } = req.user;
      const { roomId, defaultAccess = [], metadata = {} } = req.body;

      if (!roomId) {
        return res.status(400).json({ error: "Room ID is required" });
      }

      // Sanitize room ID - Liveblocks has strict requirements
      // 1. Remove special characters
      // 2. Limit length (Liveblocks has length limits)
      // 3. Make it more readable
      let sanitizedRoomId = roomId
        .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with dashes
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .toLowerCase(); // Convert to lowercase
      
      // If the room ID is too long, create a shorter version
      if (sanitizedRoomId.length > 50) {
        const parts = roomId.split(':');
        const userPart = parts[0] ? parts[0].substring(0, 15) : 'user'; // Take first 15 chars of user ID
        const timePart = Date.now().toString().slice(-8); // Last 8 digits of timestamp
        const namePart = (metadata.name || 'room').replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        
        sanitizedRoomId = `${userPart}-${timePart}-${namePart}`.toLowerCase();
      }
      
      console.log('Original room ID:', roomId);
      console.log('Sanitized room ID:', sanitizedRoomId);

      console.log('Attempting to create room with ID:', sanitizedRoomId);
      console.log('Request payload:', { roomId, defaultAccess, metadata });

      // Try creating room with minimal options first
      try {
        // First try with no options at all
        const room = await liveblocks.createRoom(sanitizedRoomId);
        console.log('Room created successfully with minimal options');
        return res.status(200).json({ room, actualRoomId: sanitizedRoomId });
      } catch (minimalError) {
        console.log('Minimal room creation failed, trying with options...');
        
        // If that fails, try with options
        const roomOptions = {};
        
        // Only add defaultAccesses if we want public access
        if (Array.isArray(defaultAccess) && defaultAccess.length > 0) {
          roomOptions.defaultAccesses = ["room:write"];
        }
        
        console.log('Trying with options:', JSON.stringify(roomOptions, null, 2));
        const room = await liveblocks.createRoom(sanitizedRoomId, roomOptions);
        return res.status(200).json({ room, actualRoomId: sanitizedRoomId });
      }
    } catch (error) {
      console.error("Room creation error:", error);
      console.error("Error details:", {
        status: error.status,
        details: error.details,
        message: error.message,
        originalRoomId: roomId,
        sanitizedRoomId: sanitizedRoomId,
        defaultAccess,
        metadata
      });
      return res.status(500).json({ 
        error: "Failed to create room",
        details: error.details || error.message,
        suggestion: "Check room ID format and permissions"
      });
    }
  }
);

// Endpoint to get rooms accessible to user
liveblocksRouter.get(
  "/rooms",
  auth,
  checkLiveblocksConfig,
  async (req, res) => {
    try {
      const { userId } = req.user;

      // Get all rooms - you might want to filter this based on user permissions
      const { data: rooms } = await liveblocks.getRooms();

      // Filter rooms based on user access (updated for sanitized IDs)
      const sanitizedUserId = userId.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().substring(0, 15);
      
      const accessibleRooms = rooms.filter((room) => {
        // Room owner has access (check metadata)
        if (room.metadata?.createdBy === userId) return true;

        // Shared rooms have access (updated for sanitized format)
        if (room.id.startsWith("shared-")) return true;

        // User's own rooms (updated for sanitized format)
        if (room.id.startsWith(sanitizedUserId)) return true;

        // TODO: Add more complex permission checking here
        return false;
      });

      return res.status(200).json({ rooms: accessibleRooms });
    } catch (error) {
      console.error("Get rooms error:", error);
      return res.status(500).json({ error: "Failed to get rooms" });
    }
  }
);

export default liveblocksRouter;
