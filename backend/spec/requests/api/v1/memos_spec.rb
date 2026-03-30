require "rails_helper"

RSpec.describe "Api::V1::Memos", type: :request do
  let(:user) { create(:user) }
  let(:headers) { sign_in_headers(user) }

  def sign_in_headers(u)
    post "/api/v1/auth/sign_in", params: { user: { email: u.email, password: "password" } }
    token = response.headers["Authorization"]
    { "Authorization" => token, "Content-Type" => "application/json" }
  end

  describe "GET /api/v1/memos" do
    before { create_list(:memo, 2, user: user) }

    it "returns user's memos" do
      get "/api/v1/memos", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end
  end

  describe "POST /api/v1/memos" do
    it "creates a memo" do
      expect {
        post "/api/v1/memos",
          params: { memo: { title: "テスト", content: "内容", tags: [], pinned: false } }.to_json,
          headers: headers
      }.to change(Memo, :count).by(1)
      expect(response).to have_http_status(:created)
    end
  end

  describe "PUT /api/v1/memos/:id" do
    let!(:memo) { create(:memo, user: user, pinned: false) }

    it "updates the memo" do
      put "/api/v1/memos/#{memo.id}",
        params: { memo: { pinned: true } }.to_json,
        headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["pinned"]).to be true
    end
  end
end
