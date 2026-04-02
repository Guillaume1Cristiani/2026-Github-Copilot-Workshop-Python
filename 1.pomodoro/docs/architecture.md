# Architecture Overview

> **Implementation status**: MVP phase (Phase 1). Only the frontend timer engine and static UI are implemented. Backend API, database, and service layer are not yet implemented.

## System Overview

A frontend-driven single-page application. Flask is responsible only for serving templates and static files; all timer logic runs in JavaScript in the browser.

```
Browser (JavaScript)
    └── PomodoroTimerEngine (timerEngine.mjs)
            ↓ (DOM integration planned for future)
        HTML/CSS (index.html / style.css)

Flask (app.py)
    ├── GET /        → returns index.html
    └── GET /health  → {"status": "ok"}
```

## Currently Implemented Layers

### Presentation Layer

| File | Role |
|------|------|
| `templates/index.html` | Main UI template (currently static display only) |
| `static/css/style.css` | Stylesheet |
| `static/js/timerEngine.mjs` | Timer state management engine (pure JavaScript) |

### Application Layer

| File | Role |
|------|------|
| `app.py` | Flask application factory. Registers routes `/` and `/health` |

## Application Factory Pattern

`app.py` creates the Flask instance via a `create_app()` function.

```python
def create_app() -> Flask:
    app = Flask(__name__)
    # route registration
    return app

app = create_app()
```

## Design Principles

- **Drift-safe timer**: Calculates remaining time as `remaining = max(0, endTimestampMs - now)` based on the end timestamp, maintaining accurate remaining time even after tab suspension.
- **Pure logic separation**: `PomodoroTimerEngine` has no dependency on any framework, DOM, or browser API and can be run directly in Node.js tests.
- **Incremental delivery**: Expand in order: MVP → add backend API → notifications and accessibility improvements.

## Planned Future Layers

- `services/` — Business logic (PomodoroService)
- `repositories/` — Data access (SQLite adapter)
- `routes/api.py` — REST API endpoints
- UI controller (DOM bindings)
- API client (fetch wrapper)
