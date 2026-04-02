# API Reference

> **Implementation status**: MVP phase. Only the `/` and `/health` backend API endpoints are implemented. Settings, session, and statistics APIs are not yet implemented (planned for future phases).

## Endpoints

### `GET /`

Returns the main page of the application.

**Response**

| Field | Value |
|-------|-------|
| Status code | `200 OK` |
| Content-Type | `text/html` |
| Body | HTML rendered from `templates/index.html` |

---

### `GET /health`

Health check endpoint for the server.

**Response**

| Field | Value |
|-------|-------|
| Status code | `200 OK` |
| Content-Type | `application/json` |

```json
{"status": "ok"}
```

---

## Planned Future Endpoints

Based on the architecture design, the following endpoints will be added in future phases.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/settings` | Retrieve timer settings |
| `PUT` | `/api/settings` | Update timer settings |
| `POST` | `/api/sessions` | Record a completed session |
| `GET` | `/api/stats/today` | Retrieve today's statistics |
