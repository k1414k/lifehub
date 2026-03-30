class CreateTransactions < ActiveRecord::Migration[7.2]
  def change
    create_table :transactions do |t|
      t.references :user, null: false, foreign_key: true
      t.string  :title,            null: false
      t.decimal :amount,           null: false, precision: 12, scale: 2
      t.string  :transaction_type, null: false  # "income" | "expense"
      t.string  :category,         null: false
      t.date    :date,             null: false
      t.text    :note

      t.timestamps
    end

    add_index :transactions, [:user_id, :date]
    add_index :transactions, :transaction_type
  end
end
