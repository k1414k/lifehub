require "rails_helper"

RSpec.describe "Api::V1::Transactions", type: :request do
  let(:user) { create(:user) }
  let(:headers) { sign_in_headers(user) }

  def sign_in_headers(u)
    post "/api/v1/auth/sign_in", params: { user: { email: u.email, password: "password" } }
    token = response.headers["Authorization"]
    { "Authorization" => token, "Content-Type" => "application/json" }
  end

  describe "GET /api/v1/transactions" do
    before { create_list(:transaction, 3, user: user) }

    it "returns user's transactions" do
      get "/api/v1/transactions", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(3)
    end
  end

  describe "POST /api/v1/transactions" do
    let(:valid_params) do
      {
        transaction: {
          title: "ランチ", amount: 800,
          transaction_type: "expense", category: "食費",
          date: Date.today.to_s,
        },
      }
    end

    it "creates a transaction" do
      expect {
        post "/api/v1/transactions", params: valid_params.to_json, headers: headers
      }.to change(Transaction, :count).by(1)
      expect(response).to have_http_status(:created)
    end
  end

  describe "DELETE /api/v1/transactions/:id" do
    let!(:transaction) { create(:transaction, user: user) }

    it "deletes the transaction" do
      expect {
        delete "/api/v1/transactions/#{transaction.id}", headers: headers
      }.to change(Transaction, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
