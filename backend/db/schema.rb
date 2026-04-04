# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_04_03_191705) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "asset_items", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.text "description", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_asset_items_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_asset_items_on_user_id"
  end

  create_table "asset_snapshots", force: :cascade do |t|
    t.bigint "asset_item_id", null: false
    t.decimal "amount", precision: 14, scale: 2, null: false
    t.date "recorded_on", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["asset_item_id", "recorded_on"], name: "index_asset_snapshots_on_asset_item_id_and_recorded_on", unique: true
    t.index ["asset_item_id"], name: "index_asset_snapshots_on_asset_item_id"
    t.index ["recorded_on"], name: "index_asset_snapshots_on_recorded_on"
  end

  create_table "memos", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.text "content", default: "", null: false
    t.string "tags", default: [], array: true
    t.boolean "pinned", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "memo_type", default: "normal", null: false
    t.datetime "deadline_at"
    t.index ["deadline_at"], name: "index_memos_on_deadline_at"
    t.index ["memo_type"], name: "index_memos_on_memo_type"
    t.index ["pinned"], name: "index_memos_on_pinned"
    t.index ["user_id", "memo_type", "deadline_at"], name: "index_memos_on_user_id_and_memo_type_and_deadline_at"
    t.index ["user_id", "updated_at"], name: "index_memos_on_user_id_and_updated_at"
    t.index ["user_id"], name: "index_memos_on_user_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.string "transaction_type", null: false
    t.string "category", null: false
    t.date "date", null: false
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["transaction_type"], name: "index_transactions_on_transaction_type"
    t.index ["user_id", "date"], name: "index_transactions_on_user_id_and_date"
    t.index ["user_id"], name: "index_transactions_on_user_id"
  end

  create_table "user_files", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "folder", default: "/"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "created_at"], name: "index_user_files_on_user_id_and_created_at"
    t.index ["user_id"], name: "index_user_files_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", default: "", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "jti", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "asset_items", "users"
  add_foreign_key "asset_snapshots", "asset_items"
  add_foreign_key "memos", "users"
  add_foreign_key "transactions", "users"
  add_foreign_key "user_files", "users"
end
