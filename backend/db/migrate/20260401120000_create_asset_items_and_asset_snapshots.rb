class CreateAssetItemsAndAssetSnapshots < ActiveRecord::Migration[7.2]
  def change
    create_table :asset_items do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description, default: "", null: false

      t.timestamps
    end

    add_index :asset_items, [:user_id, :name], unique: true

    create_table :asset_snapshots do |t|
      t.references :asset_item, null: false, foreign_key: true
      t.decimal :amount, precision: 14, scale: 2, null: false
      t.date :recorded_on, null: false
      t.text :note

      t.timestamps
    end

    add_index :asset_snapshots, [:asset_item_id, :recorded_on], unique: true
    add_index :asset_snapshots, :recorded_on
  end
end
