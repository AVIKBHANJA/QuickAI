import React from "react";
import {
  Eraser,
  FileText,
  Hash,
  House,
  Image,
  LogOut,
  Scissors,
  SendHorizontalIcon,
  SquarePen,
  Users,
  Edit3,
  FolderOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/rooms", label: "Collaborative Rooms", Icon: FolderOpen },
  {
    to: "/ai/collaborative-editor",
    label: "Collaborative Editor",
    Icon: Edit3,
  },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
  { to: "/ai/social-media", label: "Social Media", Icon: SendHorizontalIcon },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, logout, isPaid } = useAuth();

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${
        sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out`}
    >
      <div className="my-7 w-full">
        <div className="w-13 h-13 rounded-full mx-auto bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <h1 className="mt-1 text-center">{user?.name || user?.email}</h1>
        <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded ${
                  isActive
                    ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                    : ""
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-sm font-medium">{user?.name || user?.email}</h1>
            <p className="text-xs text-gray-500">
              {isPaid ? "Premium" : "Free"} Plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={logout}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;
