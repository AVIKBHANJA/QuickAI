import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user_data");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return { success: true, message: "Registration successful!" };
      } else {
        return { success: false, message: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  };

  const getProfile = async () => {
    if (!token) return null;

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("user_data", JSON.stringify(data.user));
        return data.user;
      }
    } catch (error) {
      console.error("Get profile error:", error);
    }
    return null;
  };

  const verifyPayment = async (
    transactionId,
    amount,
    paymentMethod = "gpay"
  ) => {
    if (!token) return { success: false, message: "Not authenticated" };

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transactionId, amount, paymentMethod }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token); // Update token with new paid status
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_data", JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error("Payment verification error:", error);
      return { success: false, message: "Payment verification failed" };
    }
  };

  const getPaymentInfo = async () => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/payment-info`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get payment info error:", error);
      return { success: false, message: "Failed to get payment info" };
    }
  };

  const updateUsage = async () => {
    if (!token) return { success: false, message: "Not authenticated" };

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/api/user/update-usage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ usageIncrement: 1 }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update usage error:", error);
      return { success: false, message: "Failed to update usage" };
    }
  };

  const getToken = async () => {
    return token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getProfile,
    getToken,
    verifyPayment,
    getPaymentInfo,
    updateUsage,
    isAuthenticated: !!token,
    isPaid: user?.isPaid || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
