import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function RoomManager() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [newRoomName, setNewRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState(null);

  // Fetch user's accessible rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/liveblocks/rooms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to load rooms");
      setRooms([]); // Ensure rooms is always an array
    } finally {
      setLoading(false);
    }
  };

  // Create a new room
  const createRoom = async (isShared = false) => {
    if (!newRoomName.trim()) {
      setError("Room name is required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("No authentication token available");
      }

      const roomId = isShared
        ? `shared-${Date.now().toString().slice(-8)}-${newRoomName
            .replace(/[^a-zA-Z0-9]/g, "-")
            .toLowerCase()
            .substring(0, 10)}`
        : `${user.id
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase()
            .substring(0, 8)}-${Date.now().toString().slice(-6)}-${newRoomName
            .replace(/[^a-zA-Z0-9]/g, "-")
            .toLowerCase()
            .substring(0, 8)}`;

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
            access: isShared ? "shared" : "private", // Use access instead of defaultAccess
            metadata: {
              name: newRoomName,
              type: "document",
              isShared,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const result = await response.json();
      const actualRoomId = result.actualRoomId || roomId;

      setNewRoomName("");
      setError(null);
      fetchRooms(); // Refresh the room list

      // Navigate to the new room (use actual room ID if it was sanitized)
      navigate(`/ai/collaborative-editor?room=${actualRoomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      setError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  // Join a room by ID
  const joinRoom = (roomId) => {
    navigate(`/ai/collaborative-editor?room=${roomId}`);
  };

  // Join a room by entering room ID
  const joinRoomById = () => {
    if (!joinRoomId.trim()) {
      setError("Room ID is required");
      return;
    }

    // Clear error and navigate to room
    setError(null);
    navigate(`/ai/collaborative-editor?room=${joinRoomId.trim()}`);
  };

  // Share room link
  const shareRoom = (roomId) => {
    const shareUrl = `${window.location.origin}/ai/collaborative-editor?room=${roomId}`;
    const shareText = `Join my collaborative room: ${roomId}

You can join by:
1. Clicking this link: ${shareUrl}
2. Or manually entering room ID: ${roomId} in the app

Room ID: ${roomId}`;

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        alert("Room sharing information copied to clipboard!");
      })
      .catch(() => {
        // Fallback if clipboard API fails
        prompt("Copy this sharing information:", shareText);
      });
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please sign in to manage your collaborative rooms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Collaborative Rooms
          </h1>
          <p className="text-gray-600">
            Create and manage your collaborative document rooms.
          </p>
        </div>

        {/* Create New Room */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Room
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => createRoom(false)}
              disabled={loading || !newRoomName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Private"}
            </button>

            <button
              onClick={() => createRoom(true)}
              disabled={loading || !newRoomName.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Shared"}
            </button>
          </div>
        </div>

        {/* Join Existing Room */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Join Existing Room
          </h2>
          <p className="text-gray-600 mb-4">
            Enter a room ID shared by someone else to join their collaborative
            session.
          </p>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter room ID (e.g., shared-1234567-project-name)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={joinRoomById}
              disabled={!joinRoomId.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Room List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Rooms</h2>
          </div>

          {loading && (!rooms || rooms.length === 0) ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">Loading rooms...</p>
            </div>
          ) : !rooms || rooms.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">
                No rooms found. Create your first room above!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {(rooms || []).map((room) => (
                <div
                  key={room.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {room.metadata?.name || room.id}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Room ID: {room.id}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            room.id.startsWith("shared-")
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {room.id.startsWith("shared-") ? "Shared" : "Private"}
                        </span>
                        {room.metadata?.createdBy === user.id && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => joinRoom(room.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Open
                      </button>

                      <button
                        onClick={() => shareRoom(room.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomManager;
