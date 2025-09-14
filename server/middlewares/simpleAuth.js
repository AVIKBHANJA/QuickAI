import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Simple authentication middleware using JWT tokens
export const simpleAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please provide a valid token",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Set user data for routes
      req.user = {
        userId: decoded.userId,
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name || decoded.email,
        firstName:
          decoded.firstName ||
          decoded.name?.split(" ")[0] ||
          decoded.email.split("@")[0],
        lastName: decoded.lastName || decoded.name?.split(" ")[1] || "",
        emailAddress: decoded.email,
        imageUrl:
          decoded.imageUrl ||
          `https://api.dicebear.com/6.x/initials/svg?seed=${decoded.email}`,
        fullName: decoded.name || decoded.email,
        isPaid: decoded.isPaid || false,
        freeUsage: decoded.freeUsage || 0,
      };

      req.plan = decoded.isPaid ? "premium" : "free";
      req.free_usage = decoded.freeUsage || 0;

      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Token is expired or invalid",
      });
    }
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
      message: error.message,
    });
  }
};

// Helper function to generate JWT tokens
export const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

// Helper function to create user session data
export const createUserSession = (
  email,
  name = null,
  isPaid = false,
  freeUsage = 0
) => {
  const userId = `user_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const userData = {
    userId,
    email,
    name: name || email.split("@")[0],
    firstName: name?.split(" ")[0] || email.split("@")[0],
    lastName: name?.split(" ")[1] || "",
    isPaid,
    freeUsage,
    createdAt: new Date().toISOString(),
  };

  const token = generateToken(userData);

  return { userData, token };
};
