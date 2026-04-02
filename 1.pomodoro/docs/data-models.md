# Data Model Specification

> **Implementation status**: MVP phase. Data models are defined within the JavaScript timer engine. Python domain models and database schema are not yet implemented.

## JavaScript Timer Models

Timer state and settings are managed inside `static/js/timerEngine.mjs`.

---

### Mode Constants (`MODES`)

```js
const MODES = Object.freeze({
  FOCUS:       "focus",
  SHORT_BREAK: "short_break",
  LONG_BREAK:  "long_break",
});
```

| Value | Description |
|-------|-------------|
| `"focus"` | Focus session |
| `"short_break"` | Short break |
| `"long_break"` | Long break |

---

### Settings Object (`Settings`)

Used as the constructor argument for `PomodoroTimerEngine` and in `updateSettings()`.

```js
const DEFAULT_SETTINGS = Object.freeze({
  focusSeconds:      25 * 60,  // 1500
  shortBreakSeconds:  5 * 60,  //  300
  longBreakSeconds:  15 * 60,  //  900
  longBreakInterval: 4,
});
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `focusSeconds` | positive integer | `1500` | Duration of a focus session (seconds) |
| `shortBreakSeconds` | positive integer | `300` | Duration of a short break (seconds) |
| `longBreakSeconds` | positive integer | `900` | Duration of a long break (seconds) |
| `longBreakInterval` | positive integer | `4` | Number of focus sessions before a long break |

All fields must be positive integers; violations will throw an `Error`.

---

### Timer State Object (`TimerState`)

Returned by `getState()` and all operation methods.

```js
{
  mode: "focus",              // one of MODES
  isRunning: false,           // whether the timer is running
  remainingSeconds: 1500,     // remaining seconds
  completedFocusSessions: 0,  // number of completed focus sessions
  endTimestampMs: null,       // end timestamp (ms) when running, null when stopped
}
```

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `string` | Current mode (see `MODES` constants) |
| `isRunning` | `boolean` | Whether the timer is currently running |
| `remainingSeconds` | `number` | Remaining seconds for the current mode |
| `completedFocusSessions` | `number` | Total number of completed focus sessions |
| `endTimestampMs` | `number \| null` | End timestamp (ms) when running; `null` when stopped |

---

## Planned Future Models

The following will be added when the backend is implemented.

### Session (completed session)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Primary key |
| `mode` | string | Session mode |
| `completed_at` | datetime | Completion datetime |
| `duration_seconds` | integer | Session duration (seconds) |

### Settings (timer settings — backend persistence)

| Field | Type | Description |
|-------|------|-------------|
| `focus_seconds` | integer | Duration of a focus session (seconds) |
| `short_break_seconds` | integer | Duration of a short break (seconds) |
| `long_break_seconds` | integer | Duration of a long break (seconds) |
| `long_break_interval` | integer | Number of focus sessions before a long break |
