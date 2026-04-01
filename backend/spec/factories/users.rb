FactoryBot.define do
  factory :user do
    sequence(:name) { |n| "テストユーザー#{n}" }
    email    { Faker::Internet.unique.email }
    password { "password" }
    jti      { SecureRandom.uuid }
  end
end
