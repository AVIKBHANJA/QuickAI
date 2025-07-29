import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

// Replace with your Liveblocks public key
const client = createClient({
  publicApiKey:
    import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY ||
    "pk_dev_YOUR_LIVEBLOCKS_PUBLIC_KEY",
  throttle: 16,
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
