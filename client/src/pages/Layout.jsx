import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/Login";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user, isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <div className="flex flex-col items-start justify-start h-screen">
      <nav className="w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200">
        <img
          className="cursor-pointer w-32 sm:w-44"
          src={assets.logo}
          alt=""
          onClick={() => navigate("/")}
        />
        {sidebar ? (
          <X
            onClick={() => setSidebar(false)}
            className="w-6 h-6 text-gray-600 sm:hidden"
          />
        ) : (
          <Menu
            onClick={() => setSidebar(true)}
            className="w-6 h-6 text-gray-600 sm:hidden"
          />
        )}
      </nav>
      <div className="flex-1 w-full flex h-[calc(100vh-64px)]">
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className="flex-1 bg-[#F4F7FB]">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Access Required</h2>
        <p className="text-gray-600 mb-6">
          Please login to access the AI tools
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Login / Register
        </button>
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
      </div>
    </div>
  );
};

export default Layout;
