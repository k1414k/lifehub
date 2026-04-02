require "rails_helper"

RSpec.describe "Api::V1::Assets", type: :request do
  let(:user) { create(:user) }
  let(:headers) { sign_in_headers(user) }

  def sign_in_headers(target_user)
    post "/api/v1/auth/sign_in", params: { user: { email: target_user.email, password: "password" } }
    token = response.headers["Authorization"]
    { "Authorization" => token, "Content-Type" => "application/json" }
  end

  describe "GET /api/v1/assets" do
    before do
      create_list(:asset_item, 2, user:)
      create(:asset_item)
    end

    it "returns only current user's assets" do
      get "/api/v1/assets", headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end
  end

  describe "POST /api/v1/assets" do
    it "creates an asset item" do
      expect do
        post "/api/v1/assets",
          params: { asset: { name: "現金", description: "生活防衛資金" } }.to_json,
          headers:
      end.to change(AssetItem, :count).by(1)

      expect(response).to have_http_status(:created)
    end
  end

  describe "PUT /api/v1/assets/:id" do
    let!(:asset_item) { create(:asset_item, user:, name: "スマホ") }

    it "updates the asset item" do
      put "/api/v1/assets/#{asset_item.id}",
        params: { asset: { name: "スマートフォン", description: "下取り想定額" } }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["name"]).to eq("スマートフォン")
    end
  end

  describe "DELETE /api/v1/assets/:id" do
    let!(:asset_item) { create(:asset_item, user:) }

    it "deletes the asset item" do
      expect do
        delete "/api/v1/assets/#{asset_item.id}", headers: headers
      end.to change(AssetItem, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
