require "rails_helper"

RSpec.describe "Api::V1::AssetSnapshots", type: :request do
  let(:user) { create(:user) }
  let(:headers) { sign_in_headers(user) }
  let!(:asset_item) { create(:asset_item, user:, name: "現金") }

  def sign_in_headers(target_user)
    post "/api/v1/auth/sign_in", params: { user: { email: target_user.email, password: "password" } }
    token = response.headers["Authorization"]
    { "Authorization" => token, "Content-Type" => "application/json" }
  end

  describe "GET /api/v1/asset_snapshots" do
    before do
      create_list(:asset_snapshot, 2, asset_item:)
      create(:asset_snapshot)
    end

    it "returns only current user's snapshots" do
      get "/api/v1/asset_snapshots", headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end
  end

  describe "POST /api/v1/asset_snapshots" do
    let(:params) do
      {
        asset_snapshot: {
          asset_item_id: asset_item.id,
          amount: 500_000,
          recorded_on: Date.today.to_s,
          note: "月初の残高"
        }
      }
    end

    it "creates a snapshot" do
      expect do
        post "/api/v1/asset_snapshots", params: params.to_json, headers: headers
      end.to change(AssetSnapshot, :count).by(1)

      expect(response).to have_http_status(:created)
    end

    it "upserts when the same date already exists" do
      create(:asset_snapshot, asset_item:, recorded_on: Date.today, amount: 400_000)

      expect do
        post "/api/v1/asset_snapshots", params: params.to_json, headers: headers
      end.not_to change(AssetSnapshot, :count)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["amount"]).to eq("500000.0")
    end
  end

  describe "POST /api/v1/asset_snapshots/bulk_create" do
    let!(:second_asset_item) { create(:asset_item, user:, name: "株式") }

    it "creates multiple snapshots for one date" do
      expect do
        post "/api/v1/asset_snapshots/bulk_create",
          params: {
            asset_snapshot_batch: {
              recorded_on: Date.today.to_s,
              note: "月末評価",
              items: [
                { asset_item_id: asset_item.id, amount: 550_000 },
                { asset_item_id: second_asset_item.id, amount: 1_250_000, note: "終値ベース" }
              ]
            }
          }.to_json,
          headers: headers
      end.to change(AssetSnapshot, :count).by(2)

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body).length).to eq(2)
    end
  end

  describe "PUT /api/v1/asset_snapshots/:id" do
    let!(:asset_snapshot) { create(:asset_snapshot, asset_item:, amount: 300_000) }

    it "updates the snapshot" do
      put "/api/v1/asset_snapshots/#{asset_snapshot.id}",
        params: { asset_snapshot: { amount: 320_000, note: "査定更新" } }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["amount"]).to eq("320000.0")
    end
  end

  describe "DELETE /api/v1/asset_snapshots/:id" do
    let!(:asset_snapshot) { create(:asset_snapshot, asset_item:) }

    it "deletes the snapshot" do
      expect do
        delete "/api/v1/asset_snapshots/#{asset_snapshot.id}", headers: headers
      end.to change(AssetSnapshot, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end
