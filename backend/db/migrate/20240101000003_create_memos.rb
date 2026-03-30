class CreateMemos < ActiveRecord::Migration[7.2]
  def change
    create_table :memos do |t|
      t.references :user, null: false, foreign_key: true
      t.string  :title,   null: false
      t.text    :content, null: false, default: ""
      t.string  :tags,    array: true, default: []
      t.boolean :pinned,  null: false, default: false

      t.timestamps
    end

    add_index :memos, [:user_id, :updated_at]
    add_index :memos, :pinned
  end
end
