import { randomUUID } from "node:crypto";

export function createAppointmentService({ database, webhookService }) {
  return {
    async listAppointments() {
      return database.listAppointments();
    },

    async createAppointment({ name, email, appointmentTime, service }) {
      const appointment = {
        id: randomUUID(),
        name,
        email,
        appointmentTime,
        formattedAppointmentTime: formatAppointmentTime(appointmentTime),
        formattedAppointmentDateTime: formatAppointmentDateTime(appointmentTime),
        service,
        createdAt: new Date().toISOString()
      };

      const notification = await webhookService.checkAvailabilityAndCreateEvent(appointment);

      if (!notification.available) {
        const error = new Error(
          notification.reason ?? "That appointment time is not available. Please choose another time."
        );
        error.statusCode = notification.reason ? 502 : 409;
        throw error;
      }

      await database.insertAppointment(appointment);

      return {
        appointment,
        notification
      };
    }
  };
}

function formatAppointmentTime(value) {
  const date = new Date(value);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).toLowerCase();
}

function formatAppointmentDateTime(value) {
  const date = new Date(value);

  const formattedDate = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).toLowerCase();

  return `${formattedDate} at ${formattedTime}`;
}
