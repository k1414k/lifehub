class Memo < ApplicationRecord
  belongs_to :user

  validates :title, presence: true

  scope :pinned_first, -> { order(pinned: :desc, updated_at: :desc) }
  scope :search,       ->(q) { where("title ILIKE :q OR content ILIKE :q", q: "%#{q}%") }
end
