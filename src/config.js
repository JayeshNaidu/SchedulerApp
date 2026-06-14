import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number.parseInt(process.env.PORT ?? "3000", 10),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL ?? "",
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? ""
};
