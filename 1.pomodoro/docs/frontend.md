# フロントエンドモジュール仕様

> **実装状況**: MVP フェーズ。タイマーエンジン（`timerEngine.mjs`）は完全実装済み。UI コントローラー・API クライアントは未実装（`index.html` は現在静的表示）。

## ファイル構成

```
static/
├── js/
│   └── timerEngine.mjs        # タイマー状態管理エンジン
├── css/
│   └── style.css              # スタイルシート
├── tests/
│   └── timerEngine.test.mjs   # タイマーエンジンのユニットテスト
└── images/                    # 画像アセット

templates/
└── index.html                 # メイン HTML テンプレート
```

---

## `timerEngine.mjs` — タイマーエンジン

純粋な JavaScript モジュール。DOM・Flask・ブラウザ API に一切依存せず、Node.js 上でも直接テスト可能。

### エクスポート

| 名前 | 種別 | 説明 |
|------|------|------|
| `MODES` | 定数オブジェクト | タイマーモードの列挙値 |
| `DEFAULT_SETTINGS` | 定数オブジェクト | デフォルトのタイマー設定 |
| `PomodoroTimerEngine` | クラス | タイマーの状態管理エンジン |

---

### `PomodoroTimerEngine` クラス

#### コンストラクタ

```js
new PomodoroTimerEngine(settings = {}, initialMode = MODES.FOCUS)
```

| 引数 | 型 | デフォルト | 説明 |
|------|------|------|------|
| `settings` | オブジェクト | `{}` | 部分的な設定（`DEFAULT_SETTINGS` にマージ） |
| `initialMode` | string | `MODES.FOCUS` | 初期モード |

#### メソッド一覧

| メソッド | 引数 | 戻り値 | 説明 |
|----------|------|--------|------|
| `getState(nowMs?)` | `nowMs: number` | `TimerState` | 現在の状態を返す |
| `start(nowMs?)` | `nowMs: number` | `TimerState` | タイマーを開始する。実行中の場合は `Error` |
| `pause(nowMs?)` | `nowMs: number` | `TimerState` | タイマーを一時停止する。停止中の場合は `Error` |
| `resume(nowMs?)` | `nowMs: number` | `TimerState` | タイマーを再開する。実行中または残り 0 秒の場合は `Error` |
| `reset()` | なし | `TimerState` | 現在モードの初期時間にリセット |
| `tick(nowMs?)` | `nowMs: number` | `{ completed: boolean, state: TimerState }` | 時間を同期し、セッション完了を検出 |
| `setMode(mode)` | `mode: string` | `TimerState` | モードを変更してリセット |
| `advanceMode()` | なし | `TimerState` | ポモドーロサイクルに従い次のモードへ自動遷移 |
| `updateSettings(partialSettings?)` | `partialSettings: object` | 新しい設定オブジェクト | 設定を更新。停止中なら残り時間も再計算 |
| `getDurationForMode(mode)` | `mode: string` | `number` | 指定モードの設定秒数を返す |

#### `advanceMode()` の遷移ルール

- **集中 → 短い休憩 or 長い休憩**: `completedFocusSessions` をインクリメントし、`completedFocusSessions % longBreakInterval === 0` なら長い休憩、それ以外は短い休憩。
- **短い休憩 / 長い休憩 → 集中**: 無条件に集中モードへ戻る。

#### 使用例

```js
import { PomodoroTimerEngine, MODES } from "./timerEngine.mjs";

const engine = new PomodoroTimerEngine({ focusSeconds: 25 * 60 });

// タイマー開始
engine.start(Date.now());

// 現在の状態取得
const state = engine.getState(Date.now());
console.log(state.remainingSeconds); // 残り秒数

// 一時停止
engine.pause(Date.now());

// 再開
engine.resume(Date.now());

// モード自動遷移（集中完了後）
engine.advanceMode(); // → SHORT_BREAK または LONG_BREAK
```

---

## `style.css` — スタイルシート

### CSS カスタムプロパティ（変数）

`:root` で定義されたグローバル変数。

| 変数名 | デフォルト値 | 説明 |
|--------|-------------|------|
| `--bg-start` | `#5f63d7` | 背景グラデーション開始色 |
| `--bg-end` | `#6a56b8` | 背景グラデーション終了色 |
| `--card-bg` | `#eeedf2` | カード背景色 |
| `--stats-bg` | `#dcdeea` | 統計セクション背景色 |
| `--text-main` | `#25252d` | メインテキスト色 |
| `--text-muted` | `#6f7182` | ミュートテキスト色 |
| `--accent` | `#6a76e7` | アクセントカラー |
| `--ring-track` | `#e3e4ea` | プログレスリングのトラック色 |

### 主要コンポーネントクラス

| クラス | 説明 |
|--------|------|
| `.app-shell` | 全画面グリッドレイアウトのルートコンテナ |
| `.timer-card` | 最大幅 400px のカード（角丸・影付き） |
| `.card-header` | タイトルとウィンドウコントロールを並べるフレックスコンテナ |
| `.mode-label` | 現在のモード表示テキスト |
| `.ring-wrapper` | プログレスリングの配置コンテナ（240×240px） |
| `.ring` | `conic-gradient` を使ったプログレスリング |
| `.time-value` | リング中央の残り時間テキスト（絶対配置） |
| `.actions` | スタート・リセットボタンのフレックスコンテナ |
| `.btn` / `.btn-primary` / `.btn-outline` | ボタンスタイル |
| `.stats` | 統計セクションのカード |
| `.stats-grid` | 統計値の 2 列グリッドレイアウト |
| `.settings-placeholder` | 設定プレースホルダー（点線ボーダー） |

レスポンシブ対応: `@media (max-width: 480px)` でモバイル向けのフォントサイズ・パディング調整。

---

## `index.html` — メインテンプレート

Flask の Jinja2 テンプレート。現在は静的なプレースホルダー表示のみ。

| 要素 | 内容 |
|------|------|
| タイトル | `Pomodoro Timer` |
| CSS | `static/css/style.css` をロード |
| モード表示 | `Focus Session`（固定値） |
| 残り時間 | `25:00`（固定値） |
| ボタン | Start / Reset（非活性） |
| 設定 | `Settings (Placeholder)` プレースホルダー |
| 統計 | `4` 回完了 / `1h 40m` 集中時間（固定値） |

> JavaScript との連携は未実装。今後 UI コントローラーが `timerEngine.mjs` と接続される予定。

---

## テスト実行

```bash
cd 1.pomodoro
npm run test:js
```

`static/tests/timerEngine.test.mjs` が Node.js のビルトインテストランナーで実行されます。
