FactoryBot.define do
  factory :memo do
    association :user
    title   { Faker::Lorem.sentence(word_count: 3) }
    content { Faker::Lorem.paragraph }
    tags    { [] }
    pinned  { false }
    memo_type { "normal" }
    deadline_at { nil }

    trait :deadline do
      memo_type { "deadline" }
      deadline_at { 2.days.from_now.change(sec: 0) }
    end
  end
end
