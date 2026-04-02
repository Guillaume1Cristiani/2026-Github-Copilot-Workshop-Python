export const MODES = Object.freeze({
  FOCUS: "focus",
  SHORT_BREAK: "short_break",
  LONG_BREAK: "long_break",
});

export const DEFAULT_SETTINGS = Object.freeze({
  focusSeconds: 25 * 60,
  shortBreakSeconds: 5 * 60,
  longBreakSeconds: 15 * 60,
  longBreakInterval: 4,
});

function assertPositiveInteger(value, name) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

function assertMode(mode) {
  if (!Object.values(MODES).includes(mode)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }
}

function normalizeSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  assertPositiveInteger(merged.focusSeconds, "focusSeconds");
  assertPositiveInteger(merged.shortBreakSeconds, "shortBreakSeconds");
  assertPositiveInteger(merged.longBreakSeconds, "longBreakSeconds");
  assertPositiveInteger(merged.longBreakInterval, "longBreakInterval");
  return merged;
}

export class PomodoroTimerEngine {
  constructor(settings = {}, initialMode = MODES.FOCUS) {
    assertMode(initialMode);
    this.settings = normalizeSettings(settings);
    this.state = {
      mode: initialMode,
      isRunning: false,
      remainingSeconds: this.getDurationForMode(initialMode),
      completedFocusSessions: 0,
      endTimestampMs: null,
    };
  }

  getDurationForMode(mode) {
    assertMode(mode);
    if (mode === MODES.FOCUS) {
      return this.settings.focusSeconds;
    }
    if (mode === MODES.SHORT_BREAK) {
      return this.settings.shortBreakSeconds;
    }
    return this.settings.longBreakSeconds;
  }

  _computeRemaining(nowMs) {
    if (!this.state.isRunning || this.state.endTimestampMs === null) {
      return this.state.remainingSeconds;
    }

    const remainingMs = this.state.endTimestampMs - nowMs;
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }

  _syncRemaining(nowMs) {
    const remainingSeconds = this._computeRemaining(nowMs);
    this.state.remainingSeconds = remainingSeconds;

    if (remainingSeconds === 0) {
      this.state.isRunning = false;
      this.state.endTimestampMs = null;
    }
  }

  getState(nowMs = Date.now()) {
    const remainingSeconds = this._computeRemaining(nowMs);
    const isRunning = this.state.isRunning && remainingSeconds > 0;

    return {
      mode: this.state.mode,
      isRunning,
      remainingSeconds,
      completedFocusSessions: this.state.completedFocusSessions,
      endTimestampMs: isRunning ? this.state.endTimestampMs : null,
    };
  }

  start(nowMs = Date.now()) {
    if (this.state.isRunning) {
      throw new Error("Cannot start while timer is already running.");
    }

    if (this.state.remainingSeconds <= 0) {
      this.state.remainingSeconds = this.getDurationForMode(this.state.mode);
    }

    this.state.isRunning = true;
    this.state.endTimestampMs = nowMs + this.state.remainingSeconds * 1000;
    return this.getState(nowMs);
  }

  pause(nowMs = Date.now()) {
    if (!this.state.isRunning) {
      throw new Error("Cannot pause when timer is not running.");
    }

    this._syncRemaining(nowMs);
    this.state.isRunning = false;
    this.state.endTimestampMs = null;
    return this.getState(nowMs);
  }

  resume(nowMs = Date.now()) {
    if (this.state.isRunning) {
      throw new Error("Cannot resume while timer is already running.");
    }

    if (this.state.remainingSeconds <= 0) {
      throw new Error("Cannot resume a completed timer. Reset or advance mode first.");
    }

    this.state.isRunning = true;
    this.state.endTimestampMs = nowMs + this.state.remainingSeconds * 1000;
    return this.getState(nowMs);
  }

  reset() {
    this.state.isRunning = false;
    this.state.endTimestampMs = null;
    this.state.remainingSeconds = this.getDurationForMode(this.state.mode);
    return this.getState();
  }

  tick(nowMs = Date.now()) {
    const previousRemaining = this.state.remainingSeconds;
    this._syncRemaining(nowMs);

    return {
      completed: previousRemaining > 0 && this.state.remainingSeconds === 0,
      state: this.getState(nowMs),
    };
  }

  setMode(mode) {
    assertMode(mode);
    this.state.mode = mode;
    this.state.isRunning = false;
    this.state.endTimestampMs = null;
    this.state.remainingSeconds = this.getDurationForMode(mode);
    return this.getState();
  }

  advanceMode() {
    let nextMode;

    if (this.state.mode === MODES.FOCUS) {
      this.state.completedFocusSessions += 1;
      const shouldTakeLongBreak =
        this.state.completedFocusSessions % this.settings.longBreakInterval === 0;
      nextMode = shouldTakeLongBreak ? MODES.LONG_BREAK : MODES.SHORT_BREAK;
    } else {
      nextMode = MODES.FOCUS;
    }

    this.state.mode = nextMode;
    this.state.isRunning = false;
    this.state.endTimestampMs = null;
    this.state.remainingSeconds = this.getDurationForMode(nextMode);
    return this.getState();
  }

  updateSettings(partialSettings = {}) {
    this.settings = normalizeSettings({ ...this.settings, ...partialSettings });

    if (!this.state.isRunning) {
      this.state.remainingSeconds = this.getDurationForMode(this.state.mode);
    }

    return {
      ...this.settings,
    };
  }
}
