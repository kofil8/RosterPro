import cors from "cors";
import "dotenv/config";
import express, { Application } from "express";
import helmet from "helmet";
import { createServer } from "http";
import { connectRedis } from "./config/redis";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { apiLimiter } from "./middleware/rateLimiter";

// Import routes
import adminRoutes from "./routes/admin.routes";
import attendanceRoutes from "./routes/attendance.routes";
import authRoutes from "./routes/auth.routes";
import payrollRoutes from "./routes/payroll.routes";
import reportsRoutes from "./routes/reports.routes";
import rosterRoutes from "./routes/roster.routes";
import shiftRoutes from "./routes/shift.routes";
import userRoutes from "./routes/user.routes";

const app: Application = express();
const httpServer = createServer(app);

// Port configuration
const PORT = process.env.PORT || 9001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/roster", rosterRoutes);
app.use("/api/shift", shiftRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/reports", reportsRoutes);

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to Roster & Payroll Management System API",
    version: "1.0.0",
    description: "UK-based Care Agency Internal System",
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();
    console.log("✅ Connected to Redis");

    // Start HTTP server
    httpServer.listen(PORT, () => {
      console.log("");
      console.log("🚀 Roster & Payroll Management System");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("");
    });

    // Handle server errors (e.g., port already in use)
    httpServer.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.error(`💡 Try one of the following:`);
        console.error(`   1. Stop the other process using port ${PORT}`);
        console.error(
          `   2. Use a different port by setting PORT environment variable`
        );
        console.error(
          `   3. On Windows, find and kill the process: netstat -ano | findstr :${PORT}`
        );
        process.exit(1);
      } else {
        console.error("❌ Server error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");

  httpServer.close(() => {
    console.log("✅ HTTP server closed");
  });

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start the server
startServer();

export { app };
