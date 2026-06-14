import { Router } from "express";

export function createAppointmentRouter({ appointmentService }) {
  const router = Router();

  router.get("/appointments", async (_request, response, next) => {
    try {
      response.json({
        items: await appointmentService.listAppointments()
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/appointments", async (request, response, next) => {
    try {
      const appointment = await appointmentService.createAppointment(request.body);
      response.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
