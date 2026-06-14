import { config } from "../config.js";

export function createWebhookService() {
  return {
    async checkAvailabilityAndCreateEvent(appointment) {
      if (!config.n8nWebhookUrl) {
        return {
          available: true,
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
          available: false,
          sent: false,
          status: response.status,
          reason: `n8n webhook failed with status ${response.status}`
        };
      }

      const contentType = response.headers.get("content-type") ?? "";
      const rawBody = await response.text();

      if (!rawBody.trim()) {
        return {
          available: false,
          sent: false,
          status: response.status,
          reason: "n8n webhook returned an empty response body."
        };
      }

      const body = contentType.includes("application/json")
        ? JSON.parse(rawBody)
        : {};
      const available = body.available !== false;

      return {
        available,
        sent: available,
        status: response.status,
        body
      };
    }
  };
}
