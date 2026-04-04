require "rails_helper"
RSpec.describe "Api::V1::Memos", type: :request do
  let(:user) { create(:user) }
  let(:headers) { { "Content-Type" => "application/json", "Accept" => "application/json", "Host" => "localhost" } }

  before do
    allow_any_instance_of(ApplicationController).to receive(:authenticate_user!).and_return(true)
    allow_any_instance_of(ApplicationController).to receive(:current_user).and_return(user)
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
          params: { memo: { title: "テスト", content: "内容", tags: [], pinned: false, memo_type: "normal" } }.to_json,
          headers: headers
      }.to change(Memo, :count).by(1)
      expect(response).to have_http_status(:created)
    end

    it "creates a deadline memo" do
      deadline_at = 2.days.from_now.change(sec: 0).iso8601

      post "/api/v1/memos",
        params: {
          memo: {
            title: "締切あり",
            content: "内容",
            tags: ["重要"],
            pinned: false,
            memo_type: "deadline",
            deadline_at: deadline_at
          }
        }.to_json,
        headers: headers

      expect(response).to have_http_status(:created)

      body = JSON.parse(response.body)
      expect(body["memo_type"]).to eq("deadline")
      expect(body["deadline_at"]).to be_present
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

    it "clears deadline_at when switching to normal memo" do
      deadline_memo = create(:memo, :deadline, user: user)

      put "/api/v1/memos/#{deadline_memo.id}",
        params: { memo: { memo_type: "normal", deadline_at: nil } }.to_json,
        headers: headers

      expect(response).to have_http_status(:ok)

      body = JSON.parse(response.body)
      expect(body["memo_type"]).to eq("normal")
      expect(body["deadline_at"]).to be_nil
    end
  end
end
