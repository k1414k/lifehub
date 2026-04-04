class Memo < ApplicationRecord
  belongs_to :user

  validates :title, presence: true
  validates :memo_type, presence: true, inclusion: { in: %w[normal deadline] }
  validates :deadline_at, presence: true, if: :deadline?
  validates :deadline_at, absence: true, unless: :deadline?

  scope :pinned_first, -> { order(pinned: :desc, updated_at: :desc) }
  scope :search,       ->(q) { where("title ILIKE :q OR content ILIKE :q", q: "%#{q}%") }
  scope :deadline_only, -> { where(memo_type: "deadline") }
  scope :deadline_first, -> { order(deadline_at: :asc, updated_at: :desc) }

  def deadline?
    memo_type == "deadline"
  end
end
