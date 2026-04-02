# データモデル仕様

> **実装状況**: MVP フェーズ。データモデルは JavaScript のタイマーエンジン内に定義されています。Python 側のドメインモデル・データベーススキーマは未実装。

## JavaScript タイマーモデル

タイマーの状態と設定は `static/js/timerEngine.mjs` 内で管理されます。

---

### モード定数 (`MODES`)

```js
const MODES = Object.freeze({
  FOCUS:       "focus",
  SHORT_BREAK: "short_break",
  LONG_BREAK:  "long_break",
});
```

| 値 | 説明 |
|----|------|
| `"focus"` | 集中セッション |
| `"short_break"` | 短い休憩 |
| `"long_break"` | 長い休憩 |

---

### 設定オブジェクト (`Settings`)

`PomodoroTimerEngine` のコンストラクタ引数および `updateSettings()` で使用。

```js
const DEFAULT_SETTINGS = Object.freeze({
  focusSeconds:      25 * 60,  // 1500
  shortBreakSeconds:  5 * 60,  //  300
  longBreakSeconds:  15 * 60,  //  900
  longBreakInterval: 4,
});
```

| フィールド | 型 | デフォルト値 | 説明 |
|---|---|---|---|
| `focusSeconds` | 正の整数 | `1500` | 集中セッションの長さ（秒） |
| `shortBreakSeconds` | 正の整数 | `300` | 短い休憩の長さ（秒） |
| `longBreakSeconds` | 正の整数 | `900` | 長い休憩の長さ（秒） |
| `longBreakInterval` | 正の整数 | `4` | 長い休憩までの集中セッション数 |

全フィールドは正の整数でなければならず、違反すると `Error` がスローされます。

---

### タイマー状態オブジェクト (`TimerState`)

`getState()` および各操作メソッドの戻り値として返されます。

```js
{
  mode: "focus",              // MODES のいずれか
  isRunning: false,           // 実行中かどうか
  remainingSeconds: 1500,     // 残り秒数
  completedFocusSessions: 0,  // 完了した集中セッション数
  endTimestampMs: null,       // 実行中の場合は終了タイムスタンプ (ms)、停止中は null
}
```

| フィールド | 型 | 説明 |
|---|---|---|
| `mode` | `string` | 現在のモード（`MODES` 定数を参照） |
| `isRunning` | `boolean` | タイマーが動作中かどうか |
| `remainingSeconds` | `number` | 現在のモードの残り秒数 |
| `completedFocusSessions` | `number` | 累計の完了集中セッション数 |
| `endTimestampMs` | `number \| null` | 実行中の終了タイムスタンプ (ms)。停止中は `null` |

---

## 今後追加予定のモデル

バックエンド実装時に以下が追加される予定です。

### Session（完了セッション）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | integer | 主キー |
| `mode` | string | セッションのモード |
| `completed_at` | datetime | 完了日時 |
| `duration_seconds` | integer | セッションの長さ（秒） |

### Settings（タイマー設定・バックエンド永続化）

| フィールド | 型 | 説明 |
|---|---|---|
| `focus_seconds` | integer | 集中セッションの長さ（秒） |
| `short_break_seconds` | integer | 短い休憩の長さ（秒） |
| `long_break_seconds` | integer | 長い休憩の長さ（秒） |
| `long_break_interval` | integer | 長い休憩までの集中セッション数 |
