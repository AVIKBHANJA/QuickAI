import express from "express";
import { authenticateToken, checkUsage } from "../middlewares/auth.js";
import {
  generateArticle,
  generateBlogTitle,
  generateImage,
  generateSocialMedia,
  removeImageBackground,
  removeImageObject,
  resumeReview,
} from "../controllers/aiController.js";
import { upload } from "../configs/multer.js";

const aiRouter = express.Router();

aiRouter.post("/generate-article", authenticateToken, checkUsage, generateArticle);
aiRouter.post("/generate-blog-title", authenticateToken, checkUsage, generateBlogTitle);
aiRouter.post("/generate-image", authenticateToken, checkUsage, generateImage);
aiRouter.post("/generate-social-media", authenticateToken, checkUsage, generateSocialMedia);

aiRouter.post(
  "/remove-image-background",
  upload.single("image"),
  authenticateToken,
  checkUsage,
  removeImageBackground
);

aiRouter.post(
  "/remove-image-object",
  upload.single("image"),
  authenticateToken,
  checkUsage,
  removeImageObject
);

aiRouter.post("/resume-review", upload.single("resume"), authenticateToken, checkUsage, resumeReview);

export default aiRouter;
