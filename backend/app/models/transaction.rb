class Transaction < ApplicationRecord
  belongs_to :user

  enum :transaction_type, { expense: "expense", income: "income" }

  validates :title,            presence: true
  validates :amount,           presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, presence: true
  validates :category,         presence: true
  validates :date,             presence: true

  scope :by_month, ->(year, month) {
    where(date: Date.new(year, month).beginning_of_month..Date.new(year, month).end_of_month)
  }
  scope :recent, -> { order(date: :desc, created_at: :desc) }
end
