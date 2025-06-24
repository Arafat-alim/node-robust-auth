import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

// Load environment variables early
dotenv.config();

// Ensure critical environment variables are set
if (!process.env.MONGODB_URI) {
  console.error(
    "CRITICAL ERROR: MONGODB_URI is not defined in environment variables."
  );
  process.exit(1); // Exit the process if a critical variable is missing
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
app.use("/api/auth", rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Node-Robust-Authentication System is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Database connection - modified for serverless compatibility
let isConnected = false;
let dbConnection = null;

const connectDB = async () => {
  if (isConnected && dbConnection) {
    console.log("Using existing database connection");
    return dbConnection;
  }

  try {
    console.log("Creating new database connection");
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });

    isConnected = true;
    dbConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    throw error;
  }
};

// Serverless-specific export
const handler = async (req, res) => {
  try {
    // Ensure database connection exists
    await connectDB();

    // Forward the request to Express
    return app(req, res);
  } catch (error) {
    console.error("Serverless handler error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Export for serverless use
export default handler;

// Local development server - only start if not in serverless environment
if (process.env.VERCEL !== "1") {
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  })();
}

// Graceful shutdown - only relevant for local development
if (process.env.VERCEL !== "1") {
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("SIGINT received. Shutting down gracefully...");
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
    process.exit(0);
  });
}
