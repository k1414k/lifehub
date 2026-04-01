require "rails_helper"

RSpec.describe AssetItem, type: :model do
  subject(:asset_item) { build(:asset_item, name: "AssetItem") }

  it { should belong_to(:user) }
  it { should have_many(:asset_snapshots).dependent(:destroy) }
  it { should validate_presence_of(:name) }
  it { should validate_uniqueness_of(:name).scoped_to(:user_id) }
end
