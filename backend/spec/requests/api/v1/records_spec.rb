require "rails_helper"
require "stringio"

RSpec.describe "Api::V1::Records", type: :request do
  describe "DELETE /api/v1/records/:feature" do
    let!(:user) { create(:user) }
    let!(:other_user) { create(:user) }
    let(:headers) { sign_in_headers(user) }

    it "resets asset items and snapshots only for the current user" do
      asset_item = create(:asset_item, user: user)
      create(:asset_snapshot, asset_item: asset_item)
      create(:asset_item, user: other_user)

      expect do
        delete "/api/v1/records/assets", headers: headers
      end.to change { user.asset_items.count }.from(1).to(0)
        .and change { user.asset_snapshots.count }.from(1).to(0)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["message"]).to eq("資産項目と記録履歴を初期化しました")
      expect(other_user.asset_items.count).to eq(1)
    end

    it "resets memos only for the current user" do
      create(:memo, user: user)
      create(:memo, user: other_user)

      expect do
        delete "/api/v1/records/memos", headers: headers
      end.to change { user.memos.count }.from(1).to(0)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["message"]).to eq("メモを初期化しました")
      expect(other_user.memos.count).to eq(1)
    end

    it "resets uploaded files only for the current user" do
      user_file = user.user_files.build
      user_file.file.attach(
        io: StringIO.new("lifehub test file"),
        filename: "lifehub.txt",
        content_type: "text/plain"
      )
      user_file.save!

      other_file = other_user.user_files.build
      other_file.file.attach(
        io: StringIO.new("other user file"),
        filename: "other.txt",
        content_type: "text/plain"
      )
      other_file.save!

      expect do
        delete "/api/v1/records/files", headers: headers
      end.to change { user.user_files.count }.from(1).to(0)

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["message"]).to eq("ファイルを初期化しました")
      expect(other_user.user_files.count).to eq(1)
    end

    it "returns not found for an invalid feature" do
      delete "/api/v1/records/unknown", headers: headers

      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)["error"]).to eq("初期化対象が不正です")
    end
  end
end
