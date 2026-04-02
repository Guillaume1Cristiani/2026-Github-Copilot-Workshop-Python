# アーキテクチャ概要

> **実装状況**: MVP フェーズ（フェーズ 1）。フロントエンドのタイマーエンジンとスタティックな UI のみ実装済み。バックエンド API・データベース・サービス層は未実装。

## システム全体像

フロントエンド主導のシングルページアプリケーション。Flask はテンプレートとスタティックファイルのホスティングのみを担当し、タイマーのロジックはすべてブラウザ上の JavaScript で実行されます。

```
ブラウザ (JavaScript)
    └── PomodoroTimerEngine (timerEngine.mjs)
            ↓ (DOM 操作は今後実装予定)
        HTML/CSS (index.html / style.css)

Flask (app.py)
    ├── GET /        → index.html を返す
    └── GET /health  → {"status": "ok"}
```

## 現在実装済みの層

### プレゼンテーション層

| ファイル | 役割 |
|----------|------|
| `templates/index.html` | メイン UI テンプレート（現在は静的表示） |
| `static/css/style.css` | スタイルシート |
| `static/js/timerEngine.mjs` | タイマー状態管理エンジン（純粋 JavaScript） |

### アプリケーション層

| ファイル | 役割 |
|----------|------|
| `app.py` | Flask アプリケーションファクトリ。ルート `/` と `/health` を登録 |

## アプリケーションファクトリパターン

`app.py` は `create_app()` 関数を通じて Flask インスタンスを生成します。

```python
def create_app() -> Flask:
    app = Flask(__name__)
    # ルート登録
    return app

app = create_app()
```

## 設計原則

- **ドリフトセーフなタイマー**: 終了タイムスタンプを基点に `remaining = max(0, endTimestampMs - now)` を計算し、tab 停止後も正確な残り時間を維持する。
- **純粋ロジック分離**: `PomodoroTimerEngine` はフレームワーク・DOM に依存せず、Node.js テストで直接実行可能。
- **段階的デリバリー**: MVP → バックエンド API 追加 → 通知・アクセシビリティ改善の順に拡張する。

## 今後追加予定の層

- `services/` — ビジネスロジック（PomodoroService）
- `repositories/` — データアクセス（SQLite アダプター）
- `routes/api.py` — REST API エンドポイント
- UI コントローラー（DOM バインディング）
- API クライアント（fetch ラッパー）
