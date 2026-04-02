class AssetItem < ApplicationRecord
  belongs_to :user

  has_many :asset_snapshots, dependent: :destroy

  validates :name, presence: true, uniqueness: { scope: :user_id }

  scope :alphabetical, -> { order(:name, :id) }
end
