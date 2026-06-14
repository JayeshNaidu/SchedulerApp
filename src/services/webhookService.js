import { config } from "../config.js";

export function createWebhookService() {
  return {
    async sendAppointmentCreated(appointment) {
      if (!config.n8nWebhookUrl) {
        return {
          sent: false,
          reason: "N8N_WEBHOOK_URL is not configured."
        };
      }

      const response = await fetch(config.n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(appointment)
      });

      if (!response.ok) {
        return {
          sent: false,
          status: response.status,
          reason: `n8n webhook failed with status ${response.status}`
        };
      }

      return {
        sent: true,
        status: response.status
      };
    }
  };
}
