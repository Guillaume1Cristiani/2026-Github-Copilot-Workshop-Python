# Pomodoro Web App Architecture Proposal

## 1. Goal and Scope
This document summarizes the agreed architecture for a Pomodoro timer web application built with Flask, HTML, CSS, and JavaScript.

Primary goals:
- Deliver a clean and responsive Pomodoro UI based on the mock.
- Keep the timer behavior deterministic and easy to test.
- Separate business rules from framework and UI details.
- Support incremental delivery from MVP to richer analytics.

## 2. Architectural Style
Use a frontend-driven timer with Flask as a backend API and static/template host.

- Frontend (browser) is responsible for real-time countdown and user interaction.
- Backend (Flask) is responsible for configuration, session persistence, and stats APIs.
- Persistence starts simple and grows with needs.

## 3. System Layers

### 3.1 Presentation Layer (HTML/CSS/JavaScript)
Responsibilities:
- Render the timer UI and controls.
- Handle user actions (start, pause, reset, mode changes).
- Display progress and session status.
- Persist temporary client state in `localStorage` for refresh recovery.

Key modules:
- Timer Engine (pure JS)
- UI Controller (DOM bindings)
- API Client (fetch wrappers)
- Browser Adapters (notification/audio/localStorage wrappers)

### 3.2 Application Layer (Flask Services)
Responsibilities:
- Expose HTTP endpoints for settings, sessions, and daily stats.
- Validate requests and enforce business rules.
- Orchestrate domain logic and repositories.

Key module:
- PomodoroService (use-case orchestration)

### 3.3 Domain Layer (Pure Business Logic)
Responsibilities:
- Define timer modes and state transitions.
- Enforce Pomodoro cycle rules, including long-break cadence.
- Compute time-left values deterministically.

Key components:
- Domain models: `Mode`, `TimerState`, `Settings`, `Session`
- State machine actions: `start`, `pause`, `resume`, `reset`, `tick`, `advance_mode`

### 3.4 Infrastructure Layer
Responsibilities:
- Data persistence and external side effects.

Key components:
- Repository interfaces: SettingsRepository, SessionRepository
- SQLite adapters for runtime
- In-memory fakes for tests
- Clock abstraction: SystemClock/FakeClock

## 4. Data and Time Strategy

### 4.1 Timer Drift Prevention
Do not rely on decrementing one second per tick. Compute remaining time from target end timestamp:

`remaining = max(0, endTimestamp - now)`

This reduces drift and improves consistency after tab suspension.

### 4.2 Persistence Strategy
- MVP: client-side persistence for in-progress state (`localStorage`).
- v1+: SQLite for settings and completed sessions.
- Future: user accounts and per-user data partitioning.

## 5. API Contract (Minimum)
- `GET /` : Serve main page.
- `GET /api/settings` : Return timer settings.
- `PUT /api/settings` : Update timer settings.
- `POST /api/sessions` : Record completed session.
- `GET /api/stats/today` : Return daily completion count and focus minutes.

## 6. Testability-First Design Decisions
To maximize unit testing ease:
- Keep domain and state-machine logic framework-agnostic.
- Inject a clock instead of calling system time directly in logic.
- Use repository interfaces with test doubles.
- Keep Flask routes thin and delegate behavior to services.
- Centralize request/response validation.
- Isolate browser side effects behind adapters.

## 7. Recommended Test Pyramid

### 7.1 Unit Tests (majority)
- Python: domain models, state machine, services, validators.
- JavaScript: timer engine and API client.

### 7.2 Integration Tests (moderate)
- Flask routes + service + SQLite adapters.
- Repository round-trip tests.

### 7.3 End-to-End Tests (small set)
- Core flow: start focus -> complete session -> stats update.

## 8. Project Structure Direction
Pomodoro-related implementation should remain under `1.pomodoro/`.

Suggested structure:
- `1.pomodoro/app.py` (entrypoint)
- `1.pomodoro/templates/` (HTML)
- `1.pomodoro/static/` (CSS/JS)
- `1.pomodoro/domain/` (pure logic)
- `1.pomodoro/services/` (application services)
- `1.pomodoro/repositories/` (interfaces + SQLite adapters)
- `1.pomodoro/tests/` (Python tests)
- `1.pomodoro/static/tests/` (JS tests)

## 9. Delivery Phases
1. Phase 1: UI timer controls + state machine + local persistence.
2. Phase 2: Flask APIs + SQLite persistence + daily stats.
3. Phase 3: Notifications, accessibility improvements, and polish.

## 10. Definition of Done for v1
- Domain/service unit tests pass.
- API integration tests pass.
- JS timer engine tests pass.
- Core user flow verified manually and without major UI defects.
- Run/test commands documented in project README.
