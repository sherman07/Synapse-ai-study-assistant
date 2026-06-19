import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { checkDatabase } from "./db/pool.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { billingRouter, billingWebhookRouter } from "./routes/billing.js";
import { cardsRouter, decksRouter } from "./routes/flashcards.js";
import { focusSessionsRouter } from "./routes/focusSessions.js";
import { generatedContentRouter, internalGeneratedContentRouter } from "./routes/generatedContent.js";
import { progressRouter } from "./routes/progress.js";
import { studyRoomsRouter } from "./routes/studyRooms.js";
import { usersRouter } from "./routes/users.js";

function createApp() {
  const app = express();
  const allowedOrigins = new Set(config.corsOrigins);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS origin is not allowed: ${origin}`));
    },
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Synapse-Auth-Mode",
      "X-Synapse-Client-Id",
      "X-Synapse-Internal-Token",
      "X-Synapse-User-Email",
      "X-Synapse-User-Id",
      "X-Synapse-User-Name",
      "X-Synapse-User-Role"
    ],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
  }));

  app.use("/api/billing/webhook", express.raw({ type: "application/json" }), billingWebhookRouter);

  app.get("/health", async (_req, res) => {
    try {
      await checkDatabase();
      res.json({
        ok: true,
        status: "ok",
        database: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey) ? "mysql+supabase" : "mysql",
        mysql: { connected: true },
        supabase: {
          auth_configured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
          storage_configured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
          schema: config.supabaseDbSchema || "public"
        }
      });
    } catch (error) {
      res.status(503).json({
        ok: false,
        status: "degraded",
        database: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey) ? "mysql+supabase" : "mysql",
        mysql: { connected: false },
        supabase: {
          auth_configured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
          storage_configured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
          schema: config.supabaseDbSchema || "public"
        },
        error: "Database connection unavailable."
      });
    }
  });

  app.use("/api/generated-content", express.json({ limit: "12mb" }), generatedContentRouter);
  app.use("/api/internal/generated-content", express.json({ limit: "12mb" }), internalGeneratedContentRouter);
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/billing", billingRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/study-rooms", studyRoomsRouter);
  app.use("/api/focus-sessions", focusSessionsRouter);
  app.use("/api/flashcard-decks", decksRouter);
  app.use("/api/flashcards", cardsRouter);
  app.use("/api/progress", progressRouter);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export { createApp };
