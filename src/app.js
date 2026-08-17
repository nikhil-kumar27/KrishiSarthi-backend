/**
 * app.js
 *
 * Single Responsibility: Configure the Express application - middleware,
 * routes, health check, and centralized error handling. Does NOT start
 * the HTTP server (see server.js).
 */

const express = require("express");
const cors = require("cors");

const recommendationRoutes = require("./routes/recommendation.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error-handler");

function createApp() {
  const app = express();

  console.log("=== KRISHI SAARTHI APP LOADED ===");
  console.log("Health route: /health");
  console.log("Recommendation route: /api/recommend");

  app.get("/", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "backend-member-4",
      message: "Krishi Saarthi backend is running",
    });
  });

  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      service: "backend-member-4",
    });
  });

  app.use("/api", recommendationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
