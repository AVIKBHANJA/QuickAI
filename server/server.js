import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

await connectCloudinary();

// Configure CORS to allow requests from the client
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173","https://quick-ai-server-blue-seven.vercel.app/"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-clerk-session-token"],
  })
);

app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => res.send("Server is Live!"));

app.use(requireAuth());

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
