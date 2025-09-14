import jwt from 'jsonwebtoken';
import sql from '../configs/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const result = await sql`
      SELECT id, name, email, is_paid, free_usage
      FROM users WHERE id = ${decoded.userId}
    `;

    if (result.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Check if user has free usage or is paid
export const checkUsage = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.is_paid) {
      req.plan = 'premium';
      req.free_usage = null;
      return next();
    }

    if (user.free_usage <= 0) {
      return res.status(403).json({ 
        error: 'Free usage limit reached. Please upgrade to premium.',
        requiresUpgrade: true 
      });
    }

    req.plan = 'free';
    req.free_usage = user.free_usage;
    next();
  } catch (error) {
    console.error('Usage check error:', error);
    res.status(500).json({ error: 'Failed to check usage' });
  }
};

// Legacy auth middleware for backward compatibility
export const auth = authenticateToken;
