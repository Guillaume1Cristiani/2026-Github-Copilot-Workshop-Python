# Frontend Module Specification

> **Implementation status**: MVP phase. The timer engine (`timerEngine.mjs`) is fully implemented. UI controller and API client are not yet implemented (`index.html` is currently static display only).

## File Structure

```
static/
├── js/
│   └── timerEngine.mjs        # Timer state management engine
├── css/
│   └── style.css              # Stylesheet
├── tests/
│   └── timerEngine.test.mjs   # Timer engine unit tests
└── images/                    # Image assets

templates/
└── index.html                 # Main HTML template
```

---

## `timerEngine.mjs` — Timer Engine

A pure JavaScript module. Has no dependency on the DOM, Flask, or any browser API, and can be tested directly in Node.js.

### Exports

| Name | Kind | Description |
|------|------|-------------|
| `MODES` | Constant object | Enumeration of timer modes |
| `DEFAULT_SETTINGS` | Constant object | Default timer settings |
| `PomodoroTimerEngine` | Class | Timer state management engine |

---

### `PomodoroTimerEngine` Class

#### Constructor

```js
new PomodoroTimerEngine(settings = {}, initialMode = MODES.FOCUS)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `settings` | object | `{}` | Partial settings (merged into `DEFAULT_SETTINGS`) |
| `initialMode` | string | `MODES.FOCUS` | Initial mode |

#### Method Summary

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getState(nowMs?)` | `nowMs: number` | `TimerState` | Returns the current state |
| `start(nowMs?)` | `nowMs: number` | `TimerState` | Starts the timer. Throws `Error` if already running |
| `pause(nowMs?)` | `nowMs: number` | `TimerState` | Pauses the timer. Throws `Error` if already stopped |
| `resume(nowMs?)` | `nowMs: number` | `TimerState` | Resumes the timer. Throws `Error` if running or 0 seconds remaining |
| `reset()` | none | `TimerState` | Resets to the initial time for the current mode |
| `tick(nowMs?)` | `nowMs: number` | `{ completed: boolean, state: TimerState }` | Syncs time and detects session completion |
| `setMode(mode)` | `mode: string` | `TimerState` | Changes mode and resets |
| `advanceMode()` | none | `TimerState` | Automatically advances to the next mode following the Pomodoro cycle |
| `updateSettings(partialSettings?)` | `partialSettings: object` | New settings object | Updates settings. If stopped, also recalculates remaining time |
| `getDurationForMode(mode)` | `mode: string` | `number` | Returns the configured duration in seconds for the given mode |

#### `advanceMode()` Transition Rules

- **Focus → Short Break or Long Break**: Increments `completedFocusSessions`; if `completedFocusSessions % longBreakInterval === 0`, transitions to long break, otherwise to short break.
- **Short Break / Long Break → Focus**: Unconditionally returns to focus mode.

#### Usage Example

```js
import { PomodoroTimerEngine, MODES } from "./timerEngine.mjs";

const engine = new PomodoroTimerEngine({ focusSeconds: 25 * 60 });

// Start the timer
engine.start(Date.now());

// Get current state
const state = engine.getState(Date.now());
console.log(state.remainingSeconds); // remaining seconds

// Pause
engine.pause(Date.now());

// Resume
engine.resume(Date.now());

// Auto-advance mode (after focus session completes)
engine.advanceMode(); // → SHORT_BREAK or LONG_BREAK
```

---

## `style.css` — Stylesheet

### CSS Custom Properties (Variables)

Global variables defined on `:root`.

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `--bg-start` | `#5f63d7` | Background gradient start color |
| `--bg-end` | `#6a56b8` | Background gradient end color |
| `--card-bg` | `#eeedf2` | Card background color |
| `--stats-bg` | `#dcdeea` | Stats section background color |
| `--text-main` | `#25252d` | Main text color |
| `--text-muted` | `#6f7182` | Muted text color |
| `--accent` | `#6a76e7` | Accent color |
| `--ring-track` | `#e3e4ea` | Progress ring track color |

### Key Component Classes

| Class | Description |
|-------|-------------|
| `.app-shell` | Root container with full-screen grid layout |
| `.timer-card` | Card with max-width 400px (rounded corners and shadow) |
| `.card-header` | Flex container for title and window controls |
| `.mode-label` | Text displaying the current mode |
| `.ring-wrapper` | Positioning container for the progress ring (240×240px) |
| `.ring` | Progress ring using `conic-gradient` |
| `.time-value` | Remaining time text centered in the ring (absolutely positioned) |
| `.actions` | Flex container for start and reset buttons |
| `.btn` / `.btn-primary` / `.btn-outline` | Button styles |
| `.stats` | Stats section card |
| `.stats-grid` | 2-column grid layout for stats values |
| `.settings-placeholder` | Settings placeholder (dashed border) |

Responsive: `@media (max-width: 480px)` adjusts font sizes and padding for mobile.

---

## `index.html` — Main Template

Flask Jinja2 template. Currently displays static placeholder content only.

| Element | Content |
|---------|---------|
| Title | `Pomodoro Timer` |
| CSS | Loads `static/css/style.css` |
| Mode display | `Focus Session` (hardcoded) |
| Remaining time | `25:00` (hardcoded) |
| Buttons | Start / Reset (inactive) |
| Settings | `Settings (Placeholder)` placeholder |
| Stats | `4` sessions completed / `1h 40m` focus time (hardcoded) |

> JavaScript integration is not yet implemented. A UI controller will connect to `timerEngine.mjs` in a future phase.

---

## Running Tests

```bash
cd 1.pomodoro
npm run test:js
```

`static/tests/timerEngine.test.mjs` is executed with the Node.js built-in test runner.
