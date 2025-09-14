import { generateToken, createUserSession } from "../middlewares/simpleAuth.js";

// In-memory user storage (replace with database in production)
const users = new Map();

// Simple user registration/login
export const loginOrRegister = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    let user = users.get(email);

    if (!user) {
      // Create new user
      const { userData, token } = createUserSession(email, name, false, 5); // 5 free uses
      users.set(email, userData);
      user = userData;

      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          isPaid: user.isPaid,
          freeUsage: user.freeUsage,
        },
        token,
      });
    } else {
      // User exists, generate new token
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          isPaid: user.isPaid,
          freeUsage: user.freeUsage,
        },
        token,
      });
    }
  } catch (error) {
    console.error("Login/Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId, email } = req.user;

    const user = users.get(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        isPaid: user.isPaid,
        freeUsage: user.freeUsage,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user profile",
    });
  }
};

// Payment verification endpoint
export const verifyPayment = async (req, res) => {
  try {
    const { email } = req.user;
    const { transactionId, amount, paymentMethod } = req.body;

    if (!transactionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID and amount are required",
      });
    }

    // In a real app, you would verify the payment with your payment processor
    // For now, we'll just mark the user as paid if they provide transaction details

    const user = users.get(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user to paid status
    user.isPaid = true;
    user.paymentDetails = {
      transactionId,
      amount,
      paymentMethod,
      paidAt: new Date().toISOString(),
      gpayId: "avikbhanja2@oksbi",
    };

    users.set(email, user);

    // Generate new token with updated status
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully! You now have premium access.",
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        isPaid: user.isPaid,
        freeUsage: user.freeUsage,
      },
      token,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// Update free usage
export const updateFreeUsage = async (req, res) => {
  try {
    const { email } = req.user;
    const { usageIncrement = 1 } = req.body;

    const user = users.get(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // If user is paid, allow unlimited usage
    if (user.isPaid) {
      return res.status(200).json({
        success: true,
        message: "Premium user - unlimited usage",
        freeUsage: -1, // -1 indicates unlimited
      });
    }

    // Check if user has free usage left
    if (user.freeUsage <= 0) {
      return res.status(403).json({
        success: false,
        message: "Free usage limit exceeded. Please upgrade to premium.",
        paymentInfo: {
          gpayId: "avikbhanja2@oksbi",
          message:
            "Send payment to this GPay ID and provide transaction details to upgrade",
        },
      });
    }

    // Decrease free usage
    user.freeUsage -= usageIncrement;
    users.set(email, user);

    return res.status(200).json({
      success: true,
      freeUsage: user.freeUsage,
      message:
        user.freeUsage <= 0
          ? "Free usage exhausted"
          : `${user.freeUsage} free uses remaining`,
    });
  } catch (error) {
    console.error("Update usage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update usage",
    });
  }
};

// Get payment info
export const getPaymentInfo = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      paymentInfo: {
        gpayId: "avikbhanja2@oksbi",
        instructions: [
          "1. Send payment to the above GPay ID",
          "2. Take a screenshot of the transaction",
          "3. Note down the transaction ID",
          "4. Use the verify payment endpoint with transaction details",
        ],
        pricing: {
          premium: "₹299 for lifetime access",
          features: [
            "Unlimited AI tool usage",
            "Priority support",
            "Access to all premium features",
            "No usage limits",
          ],
        },
      },
    });
  } catch (error) {
    console.error("Get payment info error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get payment info",
    });
  }
};
