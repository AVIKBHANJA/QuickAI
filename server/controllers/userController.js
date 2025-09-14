import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../configs/db.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email, is_paid, free_usage
    `;

    const user = result[0];
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPaid: user.is_paid,
        freeUsage: user.free_usage,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const result = await sql`
      SELECT id, name, email, password_hash, is_paid, free_usage
      FROM users WHERE email = ${email}
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPaid: user.is_paid,
        freeUsage: user.free_usage,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sql`
      SELECT id, name, email, is_paid, free_usage
      FROM users WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPaid: user.is_paid,
        freeUsage: user.free_usage,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ error: "Transaction ID is required" });
    }

    // Check if transaction already exists
    const existingPayment = await sql`
      SELECT id FROM payments WHERE transaction_id = ${transactionId}
    `;

    if (existingPayment.length > 0) {
      return res.status(400).json({ error: "Transaction already processed" });
    }

    // In a real app, you'd verify the payment with GPay API
    // For now, we'll assume all payments are valid
    await sql`
      INSERT INTO payments (user_id, transaction_id, amount, status, gpay_id)
      VALUES (${userId}, ${transactionId}, 999, 'completed', 'avikbhanja2@oksbi')
    `;

    // Update user to paid status
    await sql`
      UPDATE users SET is_paid = true WHERE id = ${userId}
    `;

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

// Update usage (decrease free usage)
export const updateUsage = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await sql`
      UPDATE users 
      SET free_usage = GREATEST(free_usage - 1, 0)
      WHERE id = ${userId} AND is_paid = false
      RETURNING free_usage
    `;

    if (result.length > 0) {
      res.json({
        success: true,
        freeUsage: result[0].free_usage,
      });
    } else {
      res.json({
        success: true,
        freeUsage: null, // User is paid
      });
    }
  } catch (error) {
    console.error("Update usage error:", error);
    res.status(500).json({ error: "Failed to update usage" });
  }
};

export const getUserCreations = async (req, res) => {
  try {
    const userId = req.user.id;

    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedCreations = async (req, res) => {
  try {
    const creations = await sql`
       SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const toggleLikeCreation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body;

    const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

    if (!creation) {
      return res.json({ success: false, message: "Creation not found" });
    }

    const currentLikes = creation.likes;
    const userIdStr = userId.toString();
    let updatedLikes;
    let message;

    if (currentLikes.includes(userIdStr)) {
      updatedLikes = currentLikes.filter((user) => user !== userIdStr);
      message = "Creation Unliked";
    } else {
      updatedLikes = [...currentLikes, userIdStr];
      message = "Creation Liked";
    }

    const formattedArray = `{${updatedLikes.join(",")}}`;

    await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

    res.json({ success: true, message });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Document Management Functions

// Get all user documents
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await sql`
      SELECT id, title, content, created_at, updated_at 
      FROM documents 
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    res.json({ success: true, documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch documents" });
  }
};

// Get single document
export const getDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const result = await sql`
      SELECT id, title, content, created_at, updated_at 
      FROM documents 
      WHERE id = ${documentId} AND user_id = ${userId}
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res.json({ success: true, document: result[0] });
  } catch (error) {
    console.error("Error fetching document:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch document" });
  }
};

// Create new document
export const createDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content = "" } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Document title is required" });
    }

    const result = await sql`
      INSERT INTO documents (user_id, title, content)
      VALUES (${userId}, ${title.trim()}, ${content})
      RETURNING id, title, content, created_at, updated_at
    `;

    res.status(201).json({ success: true, document: result[0] });
  } catch (error) {
    console.error("Error creating document:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create document" });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;
    const { title, content } = req.body;

    // Check if document exists and belongs to user
    const existing = await sql`
      SELECT id FROM documents 
      WHERE id = ${documentId} AND user_id = ${userId}
    `;

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    const result = await sql`
      UPDATE documents 
      SET title = ${title}, content = ${content}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${documentId} AND user_id = ${userId}
      RETURNING id, title, content, created_at, updated_at
    `;

    res.json({ success: true, document: result[0] });
  } catch (error) {
    console.error("Error updating document:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update document" });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    const result = await sql`
      DELETE FROM documents 
      WHERE id = ${documentId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete document" });
  }
};
