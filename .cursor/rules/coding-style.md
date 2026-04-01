# AGENTS.md

このファイルは `lifehub` リポジトリで作業するエージェント向けの共通ルールです。
README を起点にしつつ、実際のコード構成・責務分離・命名・変更パターンを前提にまとめています。

## 1. 前提

- このリポジトリは `frontend` と `backend` の 2 アプリ構成です。
- 基本の起動フロー、ポート、利用技術、テストアカウントは `README.md` を正とします。
- 開発時の標準構成は Docker です。
  - フロント: `http://localhost:3000`
  - バック: `http://localhost:3001`
- API は Rails 側の `/api/v1` に統一されています。
- 認証は Devise + JWT です。
- UI 文言、エラーメッセージ、ラベルは日本語を基準にします。

## 2. まず守ること

- フロントエンドとバックエンドは責務を混ぜないでください。
- 変更前に README と関連実装を読み、既存パターンに合わせてください。
- 既存の API 契約を変える場合は、フロントとバックを必ずセットで更新してください。
- 生成物や付随ファイルは原則編集しません。
  - 例: `frontend/.next`, `frontend/node_modules`, `backend/tmp`, `backend/log`
- DB 変更は migration で行い、`backend/db/schema.rb` を手編集しません。
- Next / Rails の既存構成を優先し、新しい通信層・状態管理・設計流儀を勝手に増やしません。
- 実装は要求範囲に限定し、無関係なリファクタや横展開を勝手に行いません。

## 3. リポジトリの理解

### 3-1. 全体像

- `frontend`
  - Next.js 15 App Router
  - TypeScript
  - Zustand
  - TanStack Query
  - axios
  - react-hook-form + zod
  - Recharts

- `backend`
  - Rails 7.2 API mode
  - PostgreSQL
  - Devise + devise-jwt
  - Active Storage
  - RSpec + FactoryBot + Shoulda Matchers

### 3-2. 機能単位

このアプリは現状、以下の 3 機能を中心に構成されています。

- Money
  - 取引一覧、作成、削除、月次サマリ、チャート
- Memos
  - 一覧、検索、作成、更新、削除、ピン留め、タグ
- Files
  - 一覧、アップロード、削除

認証系は別枠で `auth` 配下にあります。

## 4. フロントエンドのルール

### 4-1. 構造

- 画面は `frontend/src/app` 配下に置きます。
- 機能ごとのページは App Router の route 単位で分かれています。
  - `dashboard`
  - `money`
  - `memos`
  - `files`
  - `auth/login`
  - `auth/register`
- 共有 UI は `frontend/src/components` 配下に置きます。
- API 通信は `frontend/src/lib/api.ts` と `frontend/src/hooks/useApi.ts` に集約します。
- 型は `frontend/src/types/index.ts` に集約します。
- 認証状態は `frontend/src/stores/authStore.ts` で扱います。

### 4-2. 実装方針

- ページは基本的に薄く保ち、UI と画面固有ロジックに集中させます。
- 通信は `fetch` を直接増やさず、既存の `api` axios インスタンス経由に寄せてください。
- CRUD の追加はまず `useApi.ts` に hook を作り、その hook をページやコンポーネントから使います。
- API の base URL や認証ヘッダー処理は `frontend/src/lib/api.ts` に集約します。
- 状態管理はむやみに増やさず、次の使い分けを守ります。
  - サーバーデータ: TanStack Query
  - 認証ユーザー/トークン: Zustand
  - モーダル開閉や入力中状態: コンポーネント内 state

### 4-3. 既存 UI パターン

- レイアウトは各機能 route の `layout.tsx` で `Sidebar + Header + main` を構成しています。
- 主要ページは `"use client"` でクライアントコンポーネント化されています。
- 入力フォームは `react-hook-form + zod` を使う流れが既存です。
  - ログイン
  - 新規登録
  - 取引追加モーダル
- メモ編集はローカル state ベースで組まれています。既存コンポーネントの責務を壊さず拡張してください。
- 日付・金額の表示はクライアント側で整形しています。
- チャート集計ロジックはページや表示コンポーネント内の `useMemo` で計算されています。
- UI を変更する場合は、デスクトップだけでなくタブレット・モバイルでも破綻しないことを前提にしてください。
- レスポンシブ対応は後付けにせず、実装時点で考慮してください。
- 既存のレイアウトやコンポーネント責務を保ったまま、画面幅ごとの見え方を確認してください。

### 4-4. 命名とデータの扱い

- TypeScript の型名は明確な名詞で定義します。
  - `User`
  - `Transaction`
  - `Memo`
  - `FileItem`
- API から返るフィールド名は Rails の JSON をそのまま使うため、snake_case を含みます。
  - 例: `transaction_type`, `created_at`
- フロント側だけ camelCase に変換する独自処理は追加しないでください。
- 既存 API 形状を変える場合は `types/index.ts` と利用箇所を必ず一緒に更新します。

### 4-5. 通信ルール

- 認証付き通信は `Authorization` ヘッダーの Bearer token 前提です。
- 未認証時の扱いは axios のレスポンスインターセプターに寄せます。
- Query key はリソース名ベースです。
  - `["transactions"]`
  - `["memos", q]`
  - `["files"]`
- mutation 成功後は `invalidateQueries` で関連一覧を再取得する流れを保ってください。
- ファイル upload は `multipart/form-data` で `file[file]` を送る現在の仕様を維持します。

### 4-6. 追加・変更時の指針

- 新機能を追加する場合の基本順:
  1. `types/index.ts` に型を追加
  2. `hooks/useApi.ts` に query/mutation を追加
  3. 必要なら `components` に UI を追加
  4. `app/<feature>` にページや route を追加
- 既存のページ構造を大きく変える前に、同じ責務の近い画面に合わせてください。
- UI 文言は日本語で揃え、既存のトーンを壊さないでください。
- 使われていない依存があっても、安易に全面整理せず今回の作業範囲に必要なものだけ触ってください。

## 5. バックエンドのルール

### 5-1. 構造

- API コントローラは `backend/app/controllers/api/v1` 配下に置きます。
- 認証系は `backend/app/controllers/api/v1/auth` 配下です。
- 全 API は versioning された `/api/v1` 前提です。
- 共通認証と共通エラーレスポンスは `ApplicationController` に寄せます。
- モデルは `backend/app/models` 配下に置きます。
- テストは `backend/spec` 配下に置きます。

### 5-2. コントローラ方針

- すべての通常 API は `ApplicationController` 継承を前提にします。
- `ApplicationController` では `before_action :authenticate_user!` が有効です。
- ユーザー依存データは必ず `current_user` 起点で参照してください。
  - 良い例: `current_user.transactions.find(params[:id])`
  - 悪い例: `Transaction.find(params[:id])`
- レコード未検出時は rescue して `render_error(..., status: :not_found)` を使う既存流儀に合わせます。
- バリデーションエラー時は `render_errors(record)` を使う既存流儀に合わせます。
- レスポンスは現状シンプルな JSON 直返しです。serializer を勝手に導入しないでください。

### 5-3. モデル方針

- 関連、validation、scope をモデルに置く現在の構成を維持します。
- 取得順や検索条件は、コントローラに SQL を増やす前に scope 化を検討してください。
- 既存モデルの責務:
  - `User`: 認証と関連
  - `Transaction`: 金額・日付・収支種別の validation と並び順
  - `Memo`: 検索・ピン留め順
  - `UserFile`: Active Storage ラッパー

### 5-4. 認証・通信仕様

- Devise JWT の dispatch/revocation 対象 route は既存設定に従ってください。
- CORS は `FRONTEND_ORIGIN` を使う前提です。
- 認証レスポンスは auth コントローラ固有の JSON shape を返しています。
  - `message`
  - `data`
- リソース API は基本的にモデル JSON 直返しです。
- auth 系 response shape を変えるとフロントのログイン/登録処理へ影響するので、変更時は必ず両側を更新してください。

### 5-5. DB と migration

- テーブル変更は migration で行います。
- `schema.rb` は結果物なので直接編集しません。
- 既存スキーマの特徴:
  - users
  - transactions
  - memos
  - user_files
  - Active Storage 関連 tables
- 既存 index や default 値の意図を崩さないようにしてください。

### 5-6. テスト方針

- RSpec を標準とします。
- model spec は Shoulda Matchers ベースの簡潔な検証が中心です。
- request spec は auth ヘッダーを付けて API 契約を検証する流れです。
- 新しい API を追加したら、最低限 request spec を追加してください。
- 新しい model の制約を追加したら、対応する model spec を追加してください。
- FactoryBot を使い、既存 factory の書き方に合わせてください。

## 6. フロント・バックの契約ルール

- リソース名、URL、HTTP メソッドは README と routes に合わせます。
- パラメータのネスト形は Rails 側 strong params に合わせます。
  - transactions: `{ transaction: ... }`
  - memos: `{ memo: ... }`
  - files: multipart
- フロントの型、hook、画面と、バックの params 許可・response shape は常に同期させてください。
- API 仕様を変える場合は README の API 一覧も必要に応じて更新してください。

## 7. 作業時の基本フロー

README を前提に、変更時は以下の順で考えてください。

1. まず README と関連 feature の既存コードを読む
2. 変更がフロントだけか、バックだけか、契約変更を含むかを切り分ける
3. 契約変更があるならフロントとバックを同時に直す
4. 必要なら migration / type / hook / spec を追加する
5. 実行確認またはテスト確認を行う
6. README に影響する起動手順や API 仕様変更があれば更新する

## 8. 触るときの注意

- `settings` など未実装導線があっても、周辺設計を勝手に広げすぎないでください。
- middleware や依存関係に未活用部分があっても、今回の目的に必要な範囲でのみ扱ってください。
- 大規模な設計変更より、既存実装に沿った小さく一貫した変更を優先してください。
- 見た目だけを変える作業でも、データ取得・認証・API shape を壊さないことを優先してください。

## 9. このリポで推奨される変更単位

### フロントだけで完結する変更

- 表示文言の改善
- 既存データを使う UI 改善
- 画面内レイアウト改善
- 既存 hook を使う軽微な操作改善

### バックだけで完結する変更

- validation 強化
- scope 追加
- エラーメッセージ改善
- spec 追加

### フロント・バック両方が必要な変更

- 新規 API 追加
- リクエスト payload 変更
- response shape 変更
- 新しいリソース追加
- 認証まわりの変更

## 10. 実装完了時のログ記録ルール

- 実装を完了したら、必ず `logs/agent/cursor` 配下に作業ログを記録してください。
- ログファイル名には日付時刻がわかる形式を使ってください。
  - 例: `logs/agent/codex/2026-04-01_19-30-00.md`
- ログには少なくとも以下を含めてください。
  - 作業日時
  - 対象機能 / 対象ファイル
  - 変更内容の要約
  - 実装理由または判断根拠
  - 実行した確認内容
  - 未対応事項や注意点
  - この修正で使うコミットメッセージ
- ログは第三者が見ても追跡できるよう、簡潔ではなく具体的に記載してください。

### 10-1. ログ記載例

```md
# 作業ログ

- 日時: 2026-04-01 19:30:00
- 対象: memos 一覧 / frontend/src/app/memos/page.tsx
- 変更内容:
  - 検索 UI の余白を調整
  - モバイル時のレイアウト崩れを修正
- 理由:
  - 一覧画面で狭い幅のとき操作しづらかったため
- 確認:
  - デスクトップ表示確認
  - タブレット幅確認
  - モバイル幅確認
- コミットメッセージ:
  - fix: improve memos list responsive layout