import pg from "pg";
import { config } from "../config.js";

const { Pool } = pg;

export function createDatabase() {
  if (!config.databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  return {
    async initialize() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          appointment_time TEXT,
          service TEXT,
          created_at TEXT
        )
      `);
    },

    async insertAppointment(appointment) {
      await pool.query(
        `
          INSERT INTO appointments (id, name, email, appointment_time, service, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          appointment.id,
          appointment.name,
          appointment.email,
          appointment.appointmentTime,
          appointment.service,
          appointment.createdAt
        ]
      );
    },

    async listAppointments() {
      const result = await pool.query(`
        SELECT
          id,
          name,
          email,
          appointment_time AS "appointmentTime",
          service,
          created_at AS "createdAt"
        FROM appointments
        ORDER BY created_at DESC
      `);

      return result.rows;
    }
  };
}
