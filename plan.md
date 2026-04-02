# Pomodoro Timer Incremental Implementation Plan

## Objective
Deliver the Pomodoro web app incrementally with working checkpoints, strong testability, and low regression risk.

## Guiding Principles
- Ship in small, verifiable increments.
- Keep business logic framework-agnostic.
- Add tests with each functional change.
- Maintain a working app at the end of every step.

## Scope for v1
- Core Pomodoro timer behavior (focus, short break, long break)
- Settings management
- Local recovery for in-progress sessions
- Backend persistence for settings and completed sessions
- Daily statistics
- Unit and integration tests

## Step-by-Step Plan

### Step 0: Foundation and Tooling
Tasks:
- Set up Flask app structure and app factory.
- Configure templates and static asset serving.
- Add Python test setup (pytest).
- Add JavaScript test setup (Vitest or Jest).

Deliverable:
- App starts locally and baseline tests run.

Exit criteria:
- Health route responds.
- One Python sample test and one JS sample test pass.

---

### Step 1: Static UI Skeleton (Mock-Aligned)
Tasks:
- Implement HTML structure for timer screen.
- Implement CSS for layout, typography, spacing, and responsiveness.
- Add placeholders for timer, mode controls, settings panel, and stats.

Deliverable:
- Fully rendered static page that matches the mock.

Exit criteria:
- Desktop and mobile layouts are stable.
- Core UI elements are present and visually aligned.

---

### Step 2: Pure Frontend Timer Engine
Tasks:
- Build a DOM-independent timer engine module.
- Implement state transitions: start, pause, resume, reset, mode advance.
- Use end timestamp based countdown to prevent drift.

Deliverable:
- Reusable JS timer engine module.

Exit criteria:
- Unit tests cover transition matrix and long-break cycle behavior.
- Countdown is deterministic with mocked time.

---

### Step 3: UI Controller Integration
Tasks:
- Wire button actions to timer engine.
- Bind timer and mode state to UI rendering.
- Add progress visualization updates.

Deliverable:
- Interactive timer functioning in-browser without backend dependency.

Exit criteria:
- Full focus-to-break cycle works from UI.
- Button states and labels update correctly.

---

### Step 4: Local Persistence and Recovery
Tasks:
- Add localStorage adapter for in-progress state.
- Restore timer state on refresh.
- Handle expired end-time recovery logic.

Deliverable:
- Reliable state continuity across page reloads.

Exit criteria:
- Running or paused session restores correctly.
- Expired sessions recover to consistent state.

---

### Step 5: Python Domain Layer
Tasks:
- Implement pure domain models (Mode, TimerState, Settings, Session).
- Add business validations and transition rules.

Deliverable:
- Backend domain model package independent from Flask.

Exit criteria:
- Domain unit tests pass.
- Invalid input paths are covered.

---

### Step 6: Service Layer and Clock Abstraction
Tasks:
- Implement Pomodoro service use-cases.
- Introduce clock abstraction (system clock and fake clock).
- Remove direct wall-clock usage in core logic.

Deliverable:
- Deterministic service layer orchestrating domain behavior.

Exit criteria:
- Service unit tests pass with fake repositories and fake clock.

---

### Step 7: Repository Contracts and SQLite Adapters
Tasks:
- Define settings and sessions repository interfaces.
- Implement SQLite adapters.
- Add schema initialization and migration baseline.

Deliverable:
- Persistent data storage for settings and completed sessions.

Exit criteria:
- Repository integration tests pass.
- Data round-trips are verified.

---

### Step 8: Flask API Implementation
Tasks:
- Implement endpoints:
  - GET /api/settings
  - PUT /api/settings
  - POST /api/sessions
  - GET /api/stats/today
- Add request validation and standard error responses.

Deliverable:
- Stable API contract for frontend integration.

Exit criteria:
- API integration tests pass for success and failure cases.

---

### Step 9: Frontend-Backend Integration
Tasks:
- Implement frontend API client wrapper.
- Load and save settings through API.
- Save completed sessions and fetch daily stats.
- Handle network failures gracefully.

Deliverable:
- End-to-end functional v1 behavior with backend persistence.

Exit criteria:
- Settings persist across restarts.
- Daily stats reflect recorded sessions.

---

### Step 10: Quality Hardening
Tasks:
- Improve keyboard accessibility and semantic labeling.
- Add edge-case handling (rapid clicks, mode switch conflicts, API errors).
- Tighten visual and interaction consistency.

Deliverable:
- Stable and user-friendly pre-release build.

Exit criteria:
- QA checklist passes.
- No critical state or UI inconsistencies.

---

### Step 11: CI and Documentation
Tasks:
- Add CI workflow for Python and JS tests.
- Document run/test commands.
- Add brief troubleshooting section.

Deliverable:
- Reproducible development and verification pipeline.

Exit criteria:
- CI is green on branch.
- New contributor can run app and tests from docs.

## Milestone Mapping
- Milestone A (MVP Client-Only): Steps 0-4
- Milestone B (Backend Core): Steps 5-8
- Milestone C (Integrated v1): Steps 9-11

## Risk Register and Mitigation
- Timer drift and tab suspension issues:
  - Mitigation: end timestamp math and recovery logic tests.
- State bugs from rapid interactions:
  - Mitigation: explicit state machine and transition tests.
- API contract mismatch between frontend and backend:
  - Mitigation: schema validation and integration tests.
- Regression across increments:
  - Mitigation: per-step test additions and CI gating.

## Definition of Done (v1)
- Core timer workflows function end-to-end.
- Settings and sessions persist using SQLite.
- Daily stats are accurate.
- Unit and integration tests pass in CI.
- Documentation covers setup, run, and test.
