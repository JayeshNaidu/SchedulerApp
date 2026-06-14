# Appointment Demo

Small `Express` app for scheduling an appointment with:

- `name`
- `email`
- `appointment time`
- `service`

## Run

```powershell
copy .env.example .env
npm install
npm run dev
```

Open:

`http://localhost:3000`

## API

`POST /api/appointments`

Example payload:

```json
{
  "name": "Ava Patel",
  "email": "ava@example.com",
  "appointmentTime": "2026-06-14T14:00",
  "service": "product-demo"
}
```

## Neon setup

1. Create a Neon project.
2. Copy the pooled connection string from the Neon dashboard.
3. Put it in `.env` as `DATABASE_URL`.
4. Start the app.

The app creates the `appointments` table automatically when the server starts.
