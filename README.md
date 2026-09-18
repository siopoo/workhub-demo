# WorkHub Demo

> A lightweight enterprise collaboration demo featuring messaging and email.

WorkHub is a portfolio-ready, desktop-first collaboration product inspired by the interaction patterns of modern team chat and mail clients. Phase one deliberately focuses on two complete workflows—direct messaging and local email—without adding authentication, real-time sockets, external mail providers, or AI features.

## Features

### Messaging

- Five seeded teammates with presence, role, last-message, and unread indicators
- Persistent one-to-one conversation history
- Optimistic message sending through a REST API
- Read-state updates when a conversation is opened

### Email

- Inbox, Starred, Sent, Drafts, and Trash folders
- Three-pane mailbox layout with unread and starred states
- Email detail, reply, forward, compose, and delete-to-trash flows
- Provider-ready `EmailService` boundary for future Gmail, IMAP, or Microsoft Graph adapters

### Contacts and persistence

- Realistic company profiles and workplace content
- SQLite database created and seeded automatically on first startup
- SQLAlchemy models designed for a straightforward future PostgreSQL migration

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui-style Radix primitives, Lucide Icons |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite |
| Testing | Pytest, Vitest, Testing Library, Playwright |

## Architecture

```text
Browser (React + TypeScript)
        │ REST / JSON
        ▼
FastAPI routers
        │
        ├── MessageService
        └── EmailService  ← future provider adapters
                 │
                 ▼
        SQLAlchemy models
                 │
                 ▼
              SQLite
```

The repository keeps UI components, API access, domain types, routers, schemas, services, models, and seed data in separate modules. The frontend development server proxies `/api` requests to FastAPI, so no local environment variable is required for the standard setup.

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
```

Backend: [http://127.0.0.1:8010](http://127.0.0.1:8010)
FastAPI docs: [http://127.0.0.1:8010/docs](http://127.0.0.1:8010/docs)

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)

## Demo Account

| Name | Role | Email |
| --- | --- | --- |
| Peng Ma | Software Engineer | `peng@workhub.demo` |

Authentication is intentionally outside phase one; the demo opens directly as Peng Ma.

## Tests and build

```bash
# Backend
cd backend
pytest -q

# Frontend
cd frontend
npm test
npm run build
```

## Screenshots

### Messaging

![WorkHub messaging](screenshots/workhub-messages.png)

### Email

![WorkHub email](screenshots/workhub-email.png)

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/contacts` | List contacts with conversation summaries |
| `GET` | `/api/conversations/{contact_id}` | Load a direct-message history |
| `POST` | `/api/messages` | Send a direct message |
| `GET` | `/api/emails?folder=inbox` | List a mailbox folder |
| `GET` | `/api/emails/{id}` | Open an email and mark inbox mail as read |
| `POST` | `/api/emails` | Compose or save an email |
| `POST` | `/api/emails/{id}/reply` | Reply to an email |
| `DELETE` | `/api/emails/{id}` | Move an email to Trash |

## Future Roadmap

- Real-time Messaging
- Gmail / Outlook Integration
- Calendar
- AI Email Assistant
- AI Agent
- RAG
- MCP
- Docker Deployment
