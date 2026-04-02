require "rails_helper"

RSpec.describe User, type: :model do
  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:email) }
  it { should have_many(:asset_items).dependent(:destroy) }
  it { should have_many(:transactions).dependent(:destroy) }
  it { should have_many(:memos).dependent(:destroy) }
  it { should have_many(:user_files).dependent(:destroy) }
end
