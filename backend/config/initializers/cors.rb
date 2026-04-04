Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    allowed_origins = ENV.fetch("FRONTEND_ORIGIN", "http://localhost:3000")
      .split(",")
      .map(&:strip)
      .reject(&:empty?)

    origins(*allowed_origins)

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      expose: ["Authorization"], # 必要に応じて追加
      credentials: true          # ← これが最重要！
  end
end
