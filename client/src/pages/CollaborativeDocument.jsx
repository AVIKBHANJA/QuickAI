import React from "react";
import { useUser } from "@clerk/clerk-react";
import { RoomProvider } from "../liveblocks.config";
import CollaborativeEditor from "../components/CollaborativeEditor";
import LiveblocksSetup from "../components/LiveblocksSetup";

function CollaborativeDocument() {
  const { user } = useUser();

  // You can make the roomId dynamic based on document ID
  const roomId = "collaborative-document-1";

  // Check if Liveblocks is properly configured
  const isConfigured =
    import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY;

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto">
          <LiveblocksSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Collaborative Document Editor
          </h1>
          <p className="text-gray-600">
            Work together in real-time with live cursors, comments, and instant
            sync.
          </p>
        </div>

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
            userInfo={{
              name: user?.fullName || user?.firstName || "Anonymous",
              picture: user?.imageUrl,
              id: user?.id,
            }}
          >
            <CollaborativeEditor />
          </RoomProvider>
        </div>
      </div>
    </div>
  );
}

export default CollaborativeDocument;
