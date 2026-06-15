# Voice Scheduler Demo

Voice-enabled appointment scheduling demo built with `Express`, `Neon Postgres`, `n8n`, `LiveKit`, and `Twilio`.

This project supports two booking paths:

- a web booking form
- a phone call with a voice agent named `Jessica`

Both flows use the same backend booking API, so the business logic stays in one place.

## Project Summary

The app collects:

- customer name
- customer email
- appointment date and time
- requested service

When a booking request is submitted, the backend:

1. receives the appointment request
2. sends it to `n8n`
3. lets `n8n` check Google Calendar availability
4. creates the calendar event if the slot is available
5. stores the appointment in `Neon Postgres`
6. returns the result to the web app or voice agent

The voice experience is handled by a separate Python LiveKit agent in the [`booking-agent`](./booking-agent) folder.

## Features

- Booking form built with `React` loaded through a CDN
- `Express` backend with API routes for booking and listing appointments
- `Neon Postgres` persistence
- `n8n` webhook integration
- Google Calendar availability + event creation through `n8n`
- Admin page to view saved appointments
- `LiveKit` voice agent that collects booking details
- `Twilio` phone number support for inbound calls to the voice agent

## Tech Stack

- Frontend: `HTML`, `CSS`, `React 18 (CDN)`
- Backend: `Node.js`, `Express`
- Database: `Neon Postgres`
- Automation: `n8n`
- Voice agent: `Python`, `LiveKit Agents`
- Telephony: `Twilio`

## Architecture

### Web booking flow

```text
Browser form -> Express API -> n8n webhook -> Google Calendar check/create
                                 |
                                 -> Neon Postgres
```

### Voice booking flow

```text
Customer phone -> Twilio -> LiveKit SIP trunk -> Jessica voice agent
                                               |
                                               -> Express API -> n8n -> Google Calendar
                                                                -> Neon Postgres
```

## Repository Structure

```text
.
|-- public/                 # Web UI and admin page
|-- src/
|   |-- routes/             # Express API routes
|   |-- services/           # Booking, database, and webhook logic
|   |-- app.js              # Express app setup
|   |-- config.js           # Environment config
|   `-- server.js           # HTTP server entrypoint
|-- booking-agent/          # LiveKit Python voice agent
|-- Dockerfile              # Container for the Express app
`-- README.md
```

## Services

### Main app

- [`src/server.js`](./src/server.js): starts the Node server
- [`src/app.js`](./src/app.js): creates the Express app and wires services together
- [`src/routes/appointments.js`](./src/routes/appointments.js): exposes booking endpoints
- [`src/services/appointmentService.js`](./src/services/appointmentService.js): core booking logic
- [`src/services/database.js`](./src/services/database.js): Neon/Postgres operations
- [`src/services/webhookService.js`](./src/services/webhookService.js): sends booking data to `n8n`

### Voice agent

- [`booking-agent/src/agent.py`](./booking-agent/src/agent.py): Jessica voice agent
- [`booking-agent/.env.example`](./booking-agent/.env.example): LiveKit/agent env template
- [`booking-agent/inbound-trunk.json`](./booking-agent/inbound-trunk.json): example inbound SIP trunk config

## Services Offered

The scheduler currently supports these appointment types:

- `product-demo`
- `technical-support`
- `sales-consultation`
- `onboarding-call`

## Environment Variables

### Root app

Copy `.env.example` to `.env` and fill in the values.

```env
PORT=3000
PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@your-neon-hostname.neon.tech/neondb?sslmode=require&channel_binding=require
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/appointment-created
```

### Voice agent

Copy `booking-agent/.env.example` to `booking-agent/.env.local`.

Typical values:

```env
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
BOOKING_API_URL=http://localhost:3000/api/appointments
```

If the backend is exposed publicly for LiveKit/Twilio testing, `BOOKING_API_URL` should point to that public URL instead, for example an `ngrok` URL or deployed backend URL.

## Local Setup

### 1. Install backend dependencies

```powershell
npm install
```

### 2. Configure the root app

```powershell
copy .env.example .env
```

Update `.env` with:

- your `Neon` database URL
- your `n8n` webhook URL

### 3. Start the backend

```powershell
npm run dev
```

Open:

- Booking form: `http://localhost:3000`
- Admin page: `http://localhost:3000/admin.html`

## Voice Agent Setup

The voice agent lives in the [`booking-agent`](./booking-agent) folder and runs separately from the Express app.

### 1. Install agent dependencies

From `booking-agent/`:

```powershell
uv sync
```

### 2. Configure the agent

```powershell
copy .env.example .env.local
```

Add:

- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `BOOKING_API_URL`

### 3. Download required model files

```powershell
uv run python src\agent.py download-files
```

### 4. Run the agent

```powershell
uv run python src\agent.py dev
```

Jessica will then register with LiveKit and wait for incoming sessions.

## Twilio + LiveKit Telephony

This project was set up for inbound calling with `Twilio` and `LiveKit`.

High-level setup:

1. create a Twilio phone number
2. create a LiveKit inbound SIP trunk
3. create a LiveKit dispatch rule to send calls to the agent
4. create a TwiML Bin in Twilio that dials the LiveKit SIP URI
5. point the Twilio number's incoming voice handler to that TwiML Bin

Once configured:

```text
Caller -> Twilio number -> LiveKit SIP trunk -> Jessica agent
```

## n8n Flow

The backend sends appointment payloads to `N8N_WEBHOOK_URL`.

Expected `n8n` behavior:

1. receive the appointment payload
2. check availability in Google Calendar
3. if available:
   - create the Google Calendar event
   - send confirmation email
   - respond with JSON containing `available: true`
4. if not available:
   - respond with JSON containing `available: false`

Example response:

```json
{
  "available": false
}
```

The backend uses that response to decide whether to save the appointment in the database.

## API

### `POST /api/appointments`

Creates an appointment.

Example request:

```json
{
  "name": "Ava Patel",
  "email": "ava@example.com",
  "appointmentTime": "2026-06-14T14:00",
  "service": "product-demo"
}
```

Success response:

```json
{
  "appointment": {
    "id": "uuid",
    "name": "Ava Patel",
    "email": "ava@example.com",
    "appointmentTime": "2026-06-14T14:00",
    "formattedAppointmentTime": "2:00 pm",
    "formattedAppointmentDateTime": "June 14, 2026 at 2:00 pm",
    "service": "product-demo",
    "createdAt": "2026-06-14T20:17:25.749Z"
  },
  "notification": {
    "available": true,
    "sent": true,
    "status": 200
  }
}
```

If the slot is unavailable, the API returns an error instead of saving to the database.

### `GET /api/appointments`

Returns all saved appointments for the admin page.

Example response:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Ava Patel",
      "email": "ava@example.com",
      "appointmentTime": "2026-06-14T14:00",
      "service": "product-demo",
      "createdAt": "2026-06-14T20:17:25.749Z"
    }
  ]
}
```

## Frontend Notes

The booking form is currently implemented with `React 18` loaded from a CDN inside [`public/index.html`](./public/index.html).

That means:

- there is no separate React build step
- the Express app still serves static files directly
- the backend API did not need to change

This was a deliberate minimal-change approach for the demo.

## Docker

### Root Dockerfile

[`Dockerfile`](./Dockerfile) builds only the `Express` app.

It does not include the Python voice agent.

### Voice agent Dockerfile

[`booking-agent/Dockerfile`](./booking-agent/Dockerfile) is separate and is intended for the `LiveKit` Python agent.

This project is therefore split into two deployable services:

- Node/Express app
- Python/LiveKit agent

## Demo Script

Short interview explanation:

1. show the booking form
2. create an appointment from the web UI
3. explain the backend flow: Express -> n8n -> Google Calendar -> Neon
4. open the admin page and show the saved appointment
5. show the voice path: Twilio -> LiveKit -> Jessica -> backend API
6. explain that both web and voice reuse the same booking logic

## Known Limitations

- React is loaded by CDN, not a bundled frontend build
- voice transcript persistence is not implemented yet
- reschedule and cancel flows are not implemented yet
- availability suggestions are still basic
- Twilio trial restrictions may block calls from unverified numbers

## Next Improvements

- save voice transcripts
- add reschedule/cancel flows
- suggest alternative time slots when unavailable
- improve admin filters and transcript viewing
- deploy both services more cleanly in the cloud

## Package Description

Suggested short project description:

`Voice-enabled appointment scheduler demo with Express, Neon Postgres, n8n automation, LiveKit, and Twilio.`
