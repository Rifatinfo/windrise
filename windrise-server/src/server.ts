import app from "./app";
import { envVars } from "./config";


const PORT = envVars.PORT;

const server = app.listen(PORT, () => {
  console.log(`Realo Server is running on port ${PORT}`);
  console.log(`Environment: ${envVars.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});

// Unhandled rejection
process.on("unhandledRejection", (reason: any, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Uncaught exception
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
