FactoryBot.define do
  factory :transaction do
    association :user
    title            { Faker::Commerce.product_name }
    amount           { rand(100..50_000) }
    transaction_type { %w[income expense].sample }
    category         { "食費" }
    date             { Faker::Date.between(from: 1.month.ago, to: Date.today) }
    note             { nil }
  end
end
