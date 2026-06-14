import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAppointmentRouter } from "./routes/appointments.js";
import { createDatabase } from "./services/database.js";
import { createAppointmentService } from "./services/appointmentService.js";
import { createWebhookService } from "./services/webhookService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = express();
  const database = createDatabase();
  const webhookService = createWebhookService();
  await database.initialize();
  const appointmentService = createAppointmentService({ database, webhookService });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use("/api", createAppointmentRouter({ appointmentService }));

  app.use((error, _request, response, _next) => {
    response.status(error.statusCode ?? 500).json({
      error: "internal_error",
      message: error.message
    });
  });

  return app;
}
