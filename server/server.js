import express from "express";
import cors from "cors";
import "dotenv/config";
import bcrypt from "bcryptjs";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import { initializeDatabase } from "./configs/initDB.js";

const app = express();

await connectCloudinary();
await initializeDatabase();

// Configure CORS
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => res.send("Server is Live!"));

// Routes
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Database initialized successfully");
  console.log("Server is running on port", PORT);
});
