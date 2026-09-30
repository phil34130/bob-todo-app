# Todo App

A simple Todo application with a **Python Flask** REST API backend and a **vanilla JavaScript** frontend. Data is persisted in SQLite (development) via SQLAlchemy.

---

## Prerequisites

| Tool | Minimum version | Notes |
|------|----------------|-------|
| Python | 3.11+ | `python --version` |
| pip | bundled with Python | used to install dependencies |

No Node.js or build tools required — the frontend is plain HTML/CSS/JS.

---

## Project Structure

```
todo-app/
├── backend/
│   ├── app.py            # Flask app factory (create_app)
│   ├── extensions.py     # SQLAlchemy, Migrate, CORS instances
│   ├── models/
│   │   └── todo.py       # Todo SQLAlchemy model
│   └── routes/
│       └── todos.py      # /api/todos Blueprint
├── frontend/
│   ├── index.html        # Single-page UI (open directly in browser)
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js        # fetch() wrappers for every endpoint
│       └── app.js        # Render logic and event listeners
├── config.py             # DevelopmentConfig / TestingConfig / ProductionConfig
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Backend Setup

### 1. Create and activate a virtual environment

```bash
cd todo-app
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy the example file and edit it as needed:

```bash
cp .env.example .env
```

`.env` keys:

| Key | Default | Description |
|-----|---------|-------------|
| `FLASK_ENV` | `development` | Controls which config class is loaded (`development`, `testing`, `production`) |
| `DATABASE_URL` | `sqlite:///todo_dev.db` | SQLAlchemy database URI |
| `SECRET_KEY` | *(set a strong value)* | Flask secret key |

### 4. Initialise the database

Run the Flask-Migrate commands once to create the schema:

```bash
export FLASK_APP=backend.app:create_app   # Windows: set FLASK_APP=backend.app:create_app
flask db init
flask db migrate -m "initial schema"
flask db upgrade
```

> **Note:** `flask db init` only needs to be run once. If a `migrations/` directory already exists, skip it and run only `flask db migrate` + `flask db upgrade` for subsequent schema changes.

### 5. Start the development server

```bash
flask run
```

The API is now available at **`http://localhost:5000`**.

---

## Frontend Usage

The frontend is a set of static files — no build step required.

1. Ensure the backend server is running (`flask run`).
2. Open `frontend/index.html` directly in your browser:
   - Double-click the file in your file manager, **or**
   - Navigate to `file:///path/to/todo-app/frontend/index.html`

The page will connect to `http://localhost:5000/api` automatically.

> **Tip:** If your browser blocks requests from a `file://` origin, serve the frontend with any static file server, e.g.:
> ```bash
> python -m http.server 8080 --directory frontend
> ```
> Then open `http://localhost:8080`.

### Features

- **Add a todo** — fill in the title, optionally choose a priority (low / medium / high), and submit.
- **Toggle done/undone** — click the checkbox next to a todo.
- **Delete a todo** — click the delete button on any item.
- **Priority badges** — each todo displays a colour-coded priority badge.

---

## API Reference

Base URL: `http://localhost:5000/api`

All request and response bodies use `Content-Type: application/json`.

| Method | Path | Description | Request body | Success |
|--------|------|-------------|-------------|---------|
| `GET` | `/todos` | List all todos. Optional `?status=open\|done` filter. | — | `200` JSON array |
| `POST` | `/todos` | Create a new todo. | `{ "title": "...", "priority": "low\|medium\|high" }` | `201` todo object |
| `GET` | `/todos/<id>` | Get a single todo by ID. | — | `200` todo object |
| `PUT` | `/todos/<id>` | Replace a todo (title, priority, done all required). | `{ "title": "...", "priority": "...", "done": bool }` | `200` todo object |
| `PATCH` | `/todos/<id>/toggle` | Flip the `done` flag. | — | `200` todo object |
| `DELETE` | `/todos/<id>` | Delete a todo. | — | `204` no content |

### Todo object schema

```json
{
  "id": 1,
  "title": "Buy groceries",
  "done": false,
  "priority": "medium",
  "created_at": "2024-01-15T10:30:00+00:00",
  "updated_at": "2024-01-15T10:30:00+00:00"
}
```

### Error responses

| Status | Body | When |
|--------|------|------|
| `400` | `{ "error": "<message>" }` | Invalid or missing request data |
| `404` | `{ "error": "Todo not found" }` | ID does not exist |

---

## Configuration Reference

Config classes are defined in [`config.py`](config.py). The active class is selected by the `FLASK_ENV` environment variable.

| Class | `FLASK_ENV` value | Debug | Database |
|-------|------------------|-------|----------|
| `DevelopmentConfig` | `development` | ✓ | `sqlite:///todo_dev.db` |
| `TestingConfig` | `testing` | — | `sqlite:///todo_test.db` |
| `ProductionConfig` | `production` | — | `DATABASE_URL` env var (required) |
