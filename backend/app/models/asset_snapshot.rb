class AssetSnapshot < ApplicationRecord
  belongs_to :asset_item

  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :recorded_on, presence: true, uniqueness: { scope: :asset_item_id }

  scope :chronological, -> { order(:recorded_on, :created_at, :id) }
  scope :recent, -> { order(recorded_on: :desc, created_at: :desc, id: :desc) }
end
