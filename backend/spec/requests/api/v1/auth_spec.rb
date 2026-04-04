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
end
