require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth" do
    let(:params) do
      {
        user: {
          name: "新規ユーザー",
          email: "signup@example.com",
          password: "password",
          password_confirmation: "password"
        }
      }
    end

    it "creates a user and returns a jwt without raising a session error" do
      expect do
        post "/api/v1/auth", params: params.to_json, headers: json_headers
      end.to change(User, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.headers["Authorization"]).to start_with("Bearer ")

      body = JSON.parse(response.body)
      expect(body["message"]).to eq("アカウントを作成しました")
      expect(body.dig("data", "email")).to eq("signup@example.com")
      expect(body.dig("data", "created_at")).to be_present
    end
  end

  describe "POST /api/v1/auth/sign_in" do
    let!(:user) { create(:user, email: "login@example.com", password: "password") }

    it "logs in and returns a jwt" do
      post "/api/v1/auth/sign_in",
        params: { user: { email: user.email, password: "password" } }.to_json,
        headers: json_headers

      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to start_with("Bearer ")

      body = JSON.parse(response.body)
      expect(body["message"]).to eq("ログインしました")
      expect(body.dig("data", "email")).to eq(user.email)
    end
  end

  describe "DELETE /api/v1/auth/sign_out" do
    let!(:user) { create(:user) }

    it "revokes the jwt and the same token can no longer access /me" do
      headers = sign_in_headers(user)
      token = headers["Authorization"]

      delete "/api/v1/auth/sign_out", headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["message"]).to eq("ログアウトしました")

      get "/api/v1/me", headers: json_headers("Authorization" => token)
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/me" do
    let!(:user) { create(:user, email: "me@example.com") }

    it "returns the authenticated user" do
      get "/api/v1/me", headers: sign_in_headers(user)

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body["email"]).to eq(user.email)
      expect(body["name"]).to eq(user.name)
      expect(body["created_at"]).to be_present
    end
  end

  describe "PATCH /api/v1/me" do
    let!(:user) { create(:user, name: "変更前ユーザー") }

    it "updates the current user profile" do
      patch "/api/v1/me",
        params: { user: { name: "変更後ニックネーム" } }.to_json,
        headers: sign_in_headers(user)

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body["message"]).to eq("アカウント情報を更新しました")
      expect(body.dig("data", "name")).to eq("変更後ニックネーム")
      expect(user.reload.name).to eq("変更後ニックネーム")
    end
  end

  describe "PATCH /api/v1/me/password" do
    let!(:user) { create(:user, password: "password", password_confirmation: "password") }

    it "updates the password when current password is valid" do
      patch "/api/v1/me/password",
        params: {
          user: {
            current_password: "password",
            password: "new-password",
            password_confirmation: "new-password"
          }
        }.to_json,
        headers: sign_in_headers(user)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["message"]).to eq("パスワードを更新しました")
      expect(user.reload.valid_password?("new-password")).to be(true)
    end

    it "rejects an invalid current password" do
      patch "/api/v1/me/password",
        params: {
          user: {
            current_password: "invalid-password",
            password: "new-password",
            password_confirmation: "new-password"
          }
        }.to_json,
        headers: sign_in_headers(user)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["error"]).to eq("現在のパスワードが正しくありません")
    end
  end
end
