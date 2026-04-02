FactoryBot.define do
  factory :asset_snapshot do
    association :asset_item
    amount { rand(1_000..2_000_000) }
    recorded_on { Faker::Date.between(from: 2.months.ago, to: Date.today) }
    note { nil }
  end
end
