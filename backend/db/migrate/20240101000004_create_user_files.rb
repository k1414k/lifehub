class CreateUserFiles < ActiveRecord::Migration[7.2]
  def change
    create_table :user_files do |t|
      t.references :user, null: false, foreign_key: true
      t.string :folder, default: "/"
      t.timestamps
    end

    add_index :user_files, [:user_id, :created_at]
  end
end
