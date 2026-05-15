# 🎫 Helpdesk Ticket Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/react-18-61DAFB)
![FastAPI](https://img.shields.io/badge/fastapi-0.111-009688)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)

A full-stack **Helpdesk Ticket Management System** built with **React**, **FastAPI (Python)**, and **MySQL**. Enables employees to raise IT support tickets and administrators to manage, resolve, and track them.

> **Capstone Project — Phase 1** | AFDE June 2026

---

## ✨ Features

- 🎫 **Create Tickets** — Employee name, department, category, description, priority
- 📋 **View All Tickets** — Filterable table with status, priority, category filters
- 🔍 **Search Tickets** — Keyword search across description, employee, category
- ✏️ **Update Tickets** — Change status, priority, add resolution notes
- 🗑️ **Delete Tickets** — Remove tickets when no longer needed
- 📊 **Dashboard** — Stats overview: total, open, in-progress, resolved, critical
- 🏷️ **Priority Levels** — Low, Medium, High, Critical
- 📌 **Status Tracking** — Open → In Progress → Resolved → Closed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│       React Frontend (Port 3000)    │
│  Dashboard │ Tickets │ Search       │
└──────────────┬──────────────────────┘
               │ REST API (HTTP/JSON)
┌──────────────▼──────────────────────┐
│     FastAPI Backend (Port 8000)     │
│  GET/POST/PUT/DELETE /tickets       │
│  GET /search  │  GET /dashboard     │
└──────────────┬──────────────────────┘
               │ SQLAlchemy ORM
┌──────────────▼──────────────────────┐
│         MySQL 8.0 Database          │
│           tickets table             │
└─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | MySQL 8.0 |
| ORM | SQLAlchemy + PyMySQL |
| Validation | Pydantic v2 |
| API Docs | Swagger UI (built-in) |

---

## 📁 Project Structure

```
helpdesk/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── database.py      # MySQL connection (SQLAlchemy)
│   ├── models.py        # Ticket table model
│   ├── schemas.py       # Pydantic request/response models
│   ├── crud.py          # All database operations
│   ├── routers/
│   │   └── tickets.py   # /tickets API routes
│   ├── .env.example     # Config template
│   └── requirements.txt # Python dependencies
│
└── frontend/
    └── src/
        ├── App.js                    # Router + layout
        ├── index.js                  # Entry point
        ├── index.css                 # Global styles
        ├── services/
        │   └── api.js                # All Axios API calls
        └── pages/
            ├── DashboardPage.js      # Stats + recent tickets
            ├── TicketsPage.js        # All tickets with filters
            ├── CreateTicketPage.js   # New ticket form
            ├── TicketDetailPage.js   # View + edit ticket
            └── SearchPage.js        # Keyword search
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10 or higher |
| Node.js | 18.x or higher |
| MySQL | 8.0 or higher |

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/helpdesk.git
cd helpdesk
```

---

### 2. Create MySQL Database

```sql
CREATE DATABASE helpdesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=helpdesk_db
DB_USER=root
DB_PASSWORD=your_mysql_password
PORT=8000
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

API docs available at: **http://127.0.0.1:8000/docs**

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://127.0.0.1:3000**

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets/` | Get all tickets (with filters) |
| GET | `/tickets/{id}` | Get ticket by ID |
| POST | `/tickets/` | Create new ticket |
| PUT | `/tickets/{id}` | Update ticket |
| DELETE | `/tickets/{id}` | Delete ticket |
| GET | `/search?q=keyword` | Search tickets |
| GET | `/dashboard` | Dashboard statistics |
| GET | `/health` | Health check |
| GET | `/docs` | Swagger API docs |

### Create Ticket — Request Body
```json
{
  "employee_name":  "John Smith",
  "department":     "Engineering",
  "issue_category": "VPN Issue",
  "description":    "Cannot connect to VPN since this morning.",
  "priority":       "High"
}
```

### Update Ticket — Request Body
```json
{
  "status":           "Resolved",
  "resolution_notes": "Reset VPN credentials and reinstalled client."
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE tickets (
    ticket_id        INT AUTO_INCREMENT PRIMARY KEY,
    employee_name    VARCHAR(200) NOT NULL,
    department       VARCHAR(200) NOT NULL,
    issue_category   VARCHAR(200) NOT NULL,
    description      TEXT NOT NULL,
    priority         VARCHAR(50) DEFAULT 'Medium',
    status           VARCHAR(50) DEFAULT 'Open',
    resolution_notes TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 📌 Ticket Categories

- VPN Issue
- Password Reset
- Software Installation
- Laptop Issue
- Email Access
- Network Connectivity
- Hardware Request
- Other

## 🚦 Priority Levels

| Priority | Description |
|----------|-------------|
| Low | Non-urgent, can wait |
| Medium | Normal priority |
| High | Needs attention soon |
| Critical | Business-blocking issue |

## 📊 Ticket Statuses

`Open` → `In Progress` → `Resolved` → `Closed`

---

## 🔧 Troubleshooting

### `mysql` not found on Windows
```cmd
set PATH=%PATH%;C:\Program Files\MySQL\MySQL Server 8.0\bin
```

### Python not found
Download from https://www.python.org/ — tick "Add Python to PATH" during install.

### CORS error in browser
Make sure backend is running on port 8000 and frontend proxy is set to `http://127.0.0.1:8000`.

### `ModuleNotFoundError`
Make sure your virtual environment is activated:
```bash
venv\Scripts\activate   # Windows
```

---

## 📄 License

MIT License — free to use for academic and commercial purposes.

---

*Helpdesk TMS v1.0.0 — Capstone Project Phase 1*
