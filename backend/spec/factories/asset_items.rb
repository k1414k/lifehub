FactoryBot.define do
  factory :asset_item do
    association :user
    sequence(:name) { |n| "資産項目#{n}" }
    description { "資産項目の説明" }
  end
end
