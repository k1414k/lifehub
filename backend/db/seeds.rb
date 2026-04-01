# dev seed data
if Rails.env.development?
  user = User.find_or_create_by!(email: "test@example.com") do |u|
    u.name     = "テストユーザー"
    u.password = "password"
    u.jti      = SecureRandom.uuid
  end

  unless user.asset_items.any?
    assets = {
      "現金" => "手元にある現金や普通預金",
      "株式" => "保有している株式や投資信託",
      "パソコン" => "仕事用・私用の PC",
      "美術品" => "コレクションとして保有している作品",
    }.map do |name, description|
      user.asset_items.create!(name:, description:)
    end.index_by(&:name)

    [
      { asset: "現金", recorded_on: Date.today - 30, amount: 480_000, note: "月末スナップショット" },
      { asset: "現金", recorded_on: Date.today - 10, amount: 500_000, note: "生活費を調整" },
      { asset: "現金", recorded_on: Date.today - 2, amount: 530_000, note: "直近残高" },
      { asset: "株式", recorded_on: Date.today - 28, amount: 1_200_000, note: "保有株の評価額" },
      { asset: "株式", recorded_on: Date.today - 7, amount: 1_260_000, note: "相場上昇後" },
      { asset: "パソコン", recorded_on: Date.today - 45, amount: 180_000, note: "購入時評価額" },
      { asset: "パソコン", recorded_on: Date.today - 5, amount: 150_000, note: "減価を反映" },
      { asset: "美術品", recorded_on: Date.today - 20, amount: 320_000, note: "査定額" },
    ].each do |attrs|
      assets.fetch(attrs[:asset]).asset_snapshots.create!(
        recorded_on: attrs[:recorded_on],
        amount: attrs[:amount],
        note: attrs[:note]
      )
    end
  end

  unless user.memos.any?
    user.memos.create!(title: "はじめてのメモ", content: "LifeHubへようこそ！", tags: ["サンプル"], pinned: true)
    user.memos.create!(title: "買い物リスト",   content: "牛乳、卵、パン",       tags: ["日常"])
  end

  puts "Seed done. email: test@example.com / password: password"
end
