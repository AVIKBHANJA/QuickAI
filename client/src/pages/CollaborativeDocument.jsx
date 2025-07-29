import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSearchParams } from "react-router-dom";
import { RoomProvider } from "../liveblocks.config";
import CollaborativeEditor from "../components/CollaborativeEditor";
import LiveblocksSetup from "../components/LiveblocksSetup";

function CollaborativeDocument() {
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get room ID from URL params or generate a user-specific one
  const roomParam = searchParams.get("room");
  const documentId = searchParams.get("doc") || "default";

  // Create room ID based on parameters
  let roomId;
  if (roomParam) {
    roomId = roomParam;
  } else if (user?.id) {
    // Create a user-specific room
    roomId = `${user.id}:${documentId}`;
  } else {
    roomId = `shared:${documentId}`;
  }

  // Check if Liveblocks is properly configured
  const isConfigured = import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY;

  // Function to create a new room
  const createRoom = async (roomId, isShared = false) => {
    try {
      setLoading(true);
      const token = await window.Clerk?.session?.getToken();

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/liveblocks/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId,
            defaultAccess: isShared ? ["room:write"] : [], // Public or private
            metadata: {
              name: `Document ${documentId}`,
              type: "collaborative-document",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const result = await response.json();
      console.log("Room created:", result);
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  // Function to share room access
  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/ai/collaborative-editor?room=${roomId}`;
    const shareText = `Join my collaborative room: ${roomId}

You can join by:
1. Clicking this link: ${shareUrl}
2. Or manually entering room ID: ${roomId} in the app at /ai/rooms

Room ID: ${roomId}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Room sharing information copied to clipboard!");
    }).catch(() => {
      // Fallback if clipboard API fails
      prompt("Copy this sharing information:", shareText);
    });
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <LiveblocksSetup />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please sign in to access the collaborative document.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Collaborative Document Editor
            </h1>
            <p className="text-gray-600">
              Work together in real-time with live cursors, comments, and
              instant sync.
            </p>
            <p className="text-sm text-gray-500 mt-1">Room ID: {roomId}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={shareRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Room
            </button>

            <button
              onClick={() => createRoom(`shared:${Date.now()}`, true)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "New Shared Room"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <RoomProvider
            id={roomId}
            initialPresence={{
              cursor: null,
            }}
            initialStorage={
              {
                // You can initialize with some default content
              }
            }
            // Pass user information from Clerk
            // User info is now handled by the access token from the server
          >
            <CollaborativeEditor />
          </RoomProvider>
        </div>
      </div>
    </div>
  );
}

export default CollaborativeDocument;
