import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Create client with access token authentication
const client = createClient({
  throttle: 16,

  // Use access token authentication
  authEndpoint: async (room) => {
    try {
      // Get the session token from Clerk
      const token = await window.Clerk?.session?.getToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/liveblocks/auth`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ room }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (
          response.status === 500 &&
          errorData.error === "Liveblocks not configured"
        ) {
          throw new Error(
            "Liveblocks is not configured on the server. Please check the setup guide."
          );
        }

        throw new Error(
          `Authentication failed: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Liveblocks authentication error:", error);
      throw error;
    }
  },

  // Resolve users for mentions and user info
  resolveUsers: async ({ userIds }) => {
    // In a real app, you'd fetch user data from your database
    // For now, we'll return mock data
    return userIds.map((userId) => ({
      name: `User ${userId}`,
      avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${userId}`,
    }));
  },
  // Resolve rooms for better room management
  resolveRoomsInfo: async ({ roomIds }) => {
    return roomIds.map((roomId) => ({
      name: `Document ${roomId}`,
      url: `/ai/collaborative-editor?room=${roomId}`,
    }));
  },
});

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
const roomContext = createRoomContext(client, {
  // presence: {
  //   cursor: { x: number, y: number } | null,
  // },
});

export const {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useSelf,
  useRoom,
  useMutation,
  useStorage,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
  useList,
  useMap,
  useObject,
  useBatch,
  useHistory,
  useEventListener,
  useConnectionState,
  useMyPresence,
} = roomContext;
