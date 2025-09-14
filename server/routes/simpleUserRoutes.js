import express from "express";
import {
  loginOrRegister,
  getUserProfile,
  verifyPayment,
  updateFreeUsage,
  getPaymentInfo,
} from "../controllers/simpleUserController.js";
import { simpleAuth } from "../middlewares/simpleAuth.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", loginOrRegister);
router.post("/register", loginOrRegister); // Same endpoint handles both
router.get("/payment-info", getPaymentInfo);

// Protected routes (authentication required)
router.get("/profile", simpleAuth, getUserProfile);
router.post("/verify-payment", simpleAuth, verifyPayment);
router.post("/update-usage", simpleAuth, updateFreeUsage);

export default router;
