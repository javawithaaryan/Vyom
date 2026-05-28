import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "./src/config/db.js";
import logger from "./src/config/logger.js";

import { globalLimiter } from "./src/middleware/rateLimiter.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

import { initSocket } from "./src/socket/index.js";

import authRoutes from "./src/routes/auth.js";
import fraudRoutes from "./src/routes/fraud.js";
import scamRoutes from "./src/routes/scam.js";
import dashboardRoutes from "./src/routes/dashboard.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| TRUST PROXY
|--------------------------------------------------------------------------
*/

app.set("trust proxy", 1);

/*
|--------------------------------------------------------------------------
| SECURITY
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://vyom-rose.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow REST tools / mobile apps / postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
|--------------------------------------------------------------------------
| LOGGING
|--------------------------------------------------------------------------
*/

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },

    skip: (req) => req.url === "/health",
  })
);

/*
|--------------------------------------------------------------------------
| BODY PARSING
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
  })
);

/*
|--------------------------------------------------------------------------
| RATE LIMITING
|--------------------------------------------------------------------------
*/

app.use(globalLimiter);

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/scam", scamRoutes);
app.use("/api/dashboard", dashboardRoutes);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((_req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| SOCKET INIT
|--------------------------------------------------------------------------
*/

const io = initSocket(server);

app.set("io", io);

/*
|--------------------------------------------------------------------------
| SERVER START
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.info("Vyom API server started", {
        port: PORT,
        env: process.env.NODE_ENV || "development",
        pid: process.pid,
      });

      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Vyom API running
🌍 Port: ${PORT}
⚙️  Env : ${process.env.NODE_ENV || "development"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    logger.error("Server startup failed", {
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| PROCESS ERROR HANDLERS
|--------------------------------------------------------------------------
*/

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Promise Rejection", {
    error: error.message,
    stack: error.stack,
  });

  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });

  process.exit(1);
});

/*
|--------------------------------------------------------------------------
| START APP
|--------------------------------------------------------------------------
*/

startServer();