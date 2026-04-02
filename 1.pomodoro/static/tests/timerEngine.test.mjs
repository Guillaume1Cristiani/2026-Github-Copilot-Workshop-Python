import test from "node:test";
import assert from "node:assert/strict";

import { MODES, PomodoroTimerEngine } from "../js/timerEngine.mjs";

test("initial state uses default focus duration", () => {
  const engine = new PomodoroTimerEngine();
  const state = engine.getState(0);

  assert.equal(state.mode, MODES.FOCUS);
  assert.equal(state.isRunning, false);
  assert.equal(state.remainingSeconds, 1500);
  assert.equal(state.completedFocusSessions, 0);
});

test("start + tick use end timestamp math deterministically", () => {
  const engine = new PomodoroTimerEngine({ focusSeconds: 10 });

  engine.start(1_000);
  assert.equal(engine.getState(1_000).remainingSeconds, 10);
  assert.equal(engine.getState(5_500).remainingSeconds, 6);
  assert.equal(engine.getState(10_999).remainingSeconds, 1);

  const { completed, state } = engine.tick(11_000);
  assert.equal(completed, true);
  assert.equal(state.remainingSeconds, 0);
  assert.equal(state.isRunning, false);
});

test("pause freezes remaining time and resume continues", () => {
  const engine = new PomodoroTimerEngine({ focusSeconds: 20 });

  engine.start(0);
  engine.pause(8_000);
  assert.equal(engine.getState(100_000).remainingSeconds, 12);

  engine.resume(200_000);
  assert.equal(engine.getState(205_000).remainingSeconds, 7);
});

test("transition guards reject invalid state actions", () => {
  const engine = new PomodoroTimerEngine();

  assert.throws(() => engine.pause(0), /not running/);

  engine.start(0);
  assert.throws(() => engine.start(1_000), /already running/);
  assert.throws(() => engine.resume(1_000), /already running/);
});

test("reset restores duration for the current mode", () => {
  const engine = new PomodoroTimerEngine({ focusSeconds: 60, shortBreakSeconds: 15 });

  engine.start(0);
  engine.pause(10_000);
  assert.equal(engine.getState(10_000).remainingSeconds, 50);

  engine.reset();
  assert.equal(engine.getState(10_000).remainingSeconds, 60);

  engine.setMode(MODES.SHORT_BREAK);
  assert.equal(engine.getState(0).remainingSeconds, 15);
  engine.start(0);
  engine.reset();
  assert.equal(engine.getState(0).remainingSeconds, 15);
});

test("advanceMode cycles focus -> short break -> focus", () => {
  const engine = new PomodoroTimerEngine({
    focusSeconds: 10,
    shortBreakSeconds: 5,
    longBreakSeconds: 20,
    longBreakInterval: 4,
  });

  let state = engine.advanceMode();
  assert.equal(state.mode, MODES.SHORT_BREAK);
  assert.equal(state.completedFocusSessions, 1);
  assert.equal(state.remainingSeconds, 5);

  state = engine.advanceMode();
  assert.equal(state.mode, MODES.FOCUS);
  assert.equal(state.completedFocusSessions, 1);
  assert.equal(state.remainingSeconds, 10);
});

test("long break is selected on configured focus interval", () => {
  const engine = new PomodoroTimerEngine({
    focusSeconds: 10,
    shortBreakSeconds: 5,
    longBreakSeconds: 20,
    longBreakInterval: 3,
  });

  let state;
  for (let i = 0; i < 3; i += 1) {
    state = engine.advanceMode();
    if (i < 2) {
      assert.equal(state.mode, MODES.SHORT_BREAK);
      state = engine.advanceMode();
      assert.equal(state.mode, MODES.FOCUS);
    }
  }

  assert.equal(state.mode, MODES.LONG_BREAK);
  assert.equal(state.completedFocusSessions, 3);
  assert.equal(state.remainingSeconds, 20);
});
