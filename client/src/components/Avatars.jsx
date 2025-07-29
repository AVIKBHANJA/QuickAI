import React from "react";
import { useOthers, useSelf } from "../liveblocks.config";

const AVATAR_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

function Avatar({ name, color, picture }) {
  return (
    <div
      className="relative flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-medium border-2 border-white shadow-md"
      style={{ backgroundColor: color }}
      title={name}
    >
      {picture ? (
        <img
          src={picture}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{name?.charAt(0)?.toUpperCase() || "?"}</span>
      )}
    </div>
  );
}

export function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {currentUser && (
          <Avatar
            name={currentUser.info?.name || "You"}
            color={AVATAR_COLORS[0]}
            picture={currentUser.info?.picture}
          />
        )}
        {users.slice(0, 3).map(({ connectionId, info }) => (
          <Avatar
            key={connectionId}
            name={info?.name || `User ${connectionId}`}
            color={AVATAR_COLORS[connectionId % AVATAR_COLORS.length]}
            picture={info?.picture}
          />
        ))}
        {users.length > 3 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white text-xs font-medium border-2 border-white shadow-md">
            +{users.length - 3}
          </div>
        )}
      </div>
      {users.length > 0 && (
        <span className="text-sm text-gray-600 ml-2">
          {users.length + 1} user{users.length + 1 !== 1 ? "s" : ""} online
        </span>
      )}
    </div>
  );
}

export default Avatars;
