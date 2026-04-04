class AddDeadlineFieldsToMemos < ActiveRecord::Migration[7.2]
  def change
    add_column :memos, :memo_type, :string, null: false, default: "normal"
    add_column :memos, :deadline_at, :datetime

    add_index :memos, :memo_type
    add_index :memos, :deadline_at
    add_index :memos, [:user_id, :memo_type, :deadline_at]
  end
end
