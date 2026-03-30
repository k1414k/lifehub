FactoryBot.define do
  factory :user do
    name     { Faker::Name.full_name }
    email    { Faker::Internet.unique.email }
    password { "password" }
    jti      { SecureRandom.uuid }
  end
end
