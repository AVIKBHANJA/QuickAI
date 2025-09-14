import React, { useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Login from "./Login";
import PaymentModal from "./PaymentModal";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isPaid } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/ai");
    } else {
      setShowLogin(true);
    }
  };

  return (
    <>
      <div className="fixed z-50 w-full backdrop-blur-2xl flex justify-between items-center py-3 px-4 sm:px-20 xl:px-32">
        <img
          src={assets.logo}
          alt="logo"
          className="w-32 sm:w-44 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-full bg-gray-100 hover:bg-gray-200 px-4 py-2"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">
                {user?.name || user?.email}
              </span>
              {isPaid && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  PRO
                </span>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-3 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {!isPaid && (
                    <p className="text-xs text-orange-600 mt-1">
                      {user?.freeUsage} free uses remaining
                    </p>
                  )}
                </div>

                {!isPaid && (
                  <button
                    onClick={() => {
                      setShowPayment(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Upgrade to Premium
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                    navigate("/");
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5 hover:bg-blue-700 transition-colors"
          >
            Get started <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}

      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </>
  );
};

export default Navbar;
