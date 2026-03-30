# dev seed data
if Rails.env.development?
  user = User.find_or_create_by!(email: "test@example.com") do |u|
    u.name     = "テストユーザー"
    u.password = "password"
    u.jti      = SecureRandom.uuid
  end

  unless user.transactions.any?
    [
      { title: "スーパー",   amount: 3200, transaction_type: "expense", category: "食費",   date: Date.today - 1 },
      { title: "電車代",    amount:  540, transaction_type: "expense", category: "交通費", date: Date.today - 2 },
      { title: "給与",      amount: 280_000, transaction_type: "income",  category: "給与",   date: Date.today - 5 },
      { title: "カフェ",   amount: 650, transaction_type: "expense", category: "食費",   date: Date.today - 3 },
    ].each { |attrs| user.transactions.create!(attrs) }
  end

  unless user.memos.any?
    user.memos.create!(title: "はじめてのメモ", content: "LifeHubへようこそ！", tags: ["サンプル"], pinned: true)
    user.memos.create!(title: "買い物リスト",   content: "牛乳、卵、パン",       tags: ["日常"])
  end

  puts "Seed done. email: test@example.com / password: password"
end
