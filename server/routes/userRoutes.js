import express from "express";
import {
  register,
  login,
  getProfile,
  verifyPayment,
  updateUsage,
  getUserCreations,
  getPublishedCreations,
  toggleLikeCreation,
  getUserDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/auth.js";

const userRouter = express.Router();

// Public routes
userRouter.post("/register", register);
userRouter.post("/login", login);

// Protected routes
userRouter.get("/profile", authenticateToken, getProfile);
userRouter.post("/verify-payment", authenticateToken, verifyPayment);
userRouter.post("/update-usage", authenticateToken, updateUsage);
userRouter.get("/get-user-creations", authenticateToken, getUserCreations);
userRouter.get("/get-published-creations", getPublishedCreations);
userRouter.post("/toggle-like-creation", authenticateToken, toggleLikeCreation);

// Document management routes
userRouter.get("/documents", authenticateToken, getUserDocuments);
userRouter.get("/documents/:id", authenticateToken, getDocument);
userRouter.post("/documents", authenticateToken, createDocument);
userRouter.put("/documents/:id", authenticateToken, updateDocument);
userRouter.delete("/documents/:id", authenticateToken, deleteDocument);

export default userRouter;
