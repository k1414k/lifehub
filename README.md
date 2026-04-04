# LifeHub — 生活管理ツール

資産管理・メモ・ファイル管理を一つにまとめたパーソナルダッシュボード。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Next.js 15 + TypeScript + Tailwind CSS |
| 状態管理 | Zustand + TanStack Query |
| バックエンド | Ruby on Rails 7.2 (API mode) |
| 認証 | Devise + devise-jwt (JWT) |
| DB | PostgreSQL 16 |
| ファイル保存 | Active Storage (ローカル / S3) |
| コンテナ | Docker / Docker Compose |

---

## ローカル起動（Docker 推奨）

### 前提条件
- Docker Desktop がインストール済みであること

### 手順

```bash
# 1. プロジェクトをクローン or ZIPを解凍
cd project

# 2. 起動（初回はイメージビルドで5〜10分かかります）
docker compose up --build

# 3. ブラウザで開く
open http://localhost:3000
```

初回起動時に自動で以下が実行されます：
- `db:create` — DBを作成
- `db:migrate` — マイグレーションを実行
- `db:seed` — テストデータを投入

**テストアカウント**
- Email: `test@example.com`
- Password: `password`

### 前提条件
- Ruby 3.3.0
- Node.js 20+
- PostgreSQL 16

### バックエンド

```bash
cd backend

# 1. gem インストール
bundle install

# 2. 環境変数ファイルをコピー（内容は適宜変更）
cp .env .env.development

# 3. DB セットアップ
rails db:create db:migrate db:seed

# 4. サーバー起動（port 3001）
rails server -p 3001
```

### フロントエンド

```bash
cd frontend

# 1. パッケージインストール
npm install

# 2. 開発サーバー起動（port 3000）
npm run dev
```

---

## ディレクトリ構成

```
project/
├── docker-compose.yml
├── frontend/                   # Next.js アプリ
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # ログイン・登録ページ
│   │   │   ├── dashboard/      # ダッシュボード
│   │   │   ├── money/          # 資産管理
│   │   │   ├── memos/          # メモ
│   │   │   └── files/          # ファイル管理
│   │   ├── components/
│   │   │   ├── layout/         # Sidebar, Header
│   │   │   ├── money/          # 資産コンポーネント
│   │   │   ├── memos/          # メモコンポーネント
│   │   │   └── files/          # ファイルコンポーネント
│   │   ├── lib/api.ts          # Axios クライアント
│   │   ├── stores/             # Zustand ストア
│   │   └── types/              # TypeScript 型定義
│   └── package.json
│
└── backend/                    # Rails API
    ├── app/
    │   ├── controllers/
    │   │   └── api/v1/
    │   │       ├── auth/       # Devise セッション・登録
    │   │       ├── assets_controller.rb
    │   │       ├── asset_snapshots_controller.rb
    │   │       ├── memos_controller.rb
    │   │       └── files_controller.rb
    │   └── models/
    │       ├── user.rb
    │       ├── asset_item.rb
    │       ├── asset_snapshot.rb
    │       ├── memo.rb
    │       └── user_file.rb
    ├── config/
    │   ├── routes.rb
    │   └── initializers/
    │       ├── devise.rb       # JWT 設定
    │       └── cors.rb
    └── db/
        └── migrate/
```

---

## API エンドポイント一覧

### 認証
| Method | Path | 説明 |
|---|---|---|
| POST | `/api/v1/auth` | 新規登録 |
| POST | `/api/v1/auth/sign_in` | ログイン → `Authorization: Bearer <token>` を返す |
| DELETE | `/api/v1/auth/sign_out` | ログアウト |
| GET | `/api/v1/me` | 自分の情報取得 |

### 資産管理
| Method | Path | 説明 |
|---|---|---|
| GET | `/api/v1/assets` | 資産項目一覧取得 |
| POST | `/api/v1/assets` | 資産項目作成 |
| PUT | `/api/v1/assets/:id` | 資産項目更新 |
| DELETE | `/api/v1/assets/:id` | 資産項目削除 |
| GET | `/api/v1/asset_snapshots` | 資産記録一覧取得 |
| POST | `/api/v1/asset_snapshots` | 単一資産記録作成・同日上書き |
| PUT | `/api/v1/asset_snapshots/:id` | 資産記録更新 |
| DELETE | `/api/v1/asset_snapshots/:id` | 資産記録削除 |
| POST | `/api/v1/asset_snapshots/bulk_create` | 複数資産を同日一括記録 |

### メモ
| Method | Path | 説明 |
|---|---|---|
| GET | `/api/v1/memos` | 一覧（`?q=検索ワード` でフィルタ可） |
| GET | `/api/v1/memos/:id` | 詳細 |
| POST | `/api/v1/memos` | 作成 |
| PUT | `/api/v1/memos/:id` | 更新 |
| DELETE | `/api/v1/memos/:id` | 削除 |

- `memo_type`
  - `normal`: 通常メモ
  - `deadline`: 締切付きメモ
- `deadline_at`
  - `memo_type=deadline` のときのみ必須の締切日時
  - 既存メモは `memo_type=normal` / `deadline_at=null` として扱われます

### ファイル
| Method | Path | 説明 |
|---|---|---|
| GET | `/api/v1/files` | 一覧 |
| POST | `/api/v1/files` | アップロード（multipart/form-data） |
| DELETE | `/api/v1/files/:id` | 削除 |

---

## 今後の拡張アイデア

- [ ] カレンダーUI（スケジュール管理）
- [ ] 予算設定・アラート機能
- [ ] メモのMarkdownプレビュー
- [ ] ファイルのフォルダ管理
- [ ] PWA対応（モバイルアプリ化）
- [ ] データエクスポート（CSV / PDF）
