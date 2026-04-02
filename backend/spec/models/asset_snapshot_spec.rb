require "rails_helper"

RSpec.describe AssetSnapshot, type: :model do
  subject(:asset_snapshot) { build(:asset_snapshot) }

  it { should belong_to(:asset_item) }
  it { should validate_presence_of(:amount) }
  it { should validate_presence_of(:recorded_on) }
  it { should validate_numericality_of(:amount).is_greater_than_or_equal_to(0) }

  it "validates recorded_on uniqueness per asset item" do
    asset_item = create(:asset_item)
    create(:asset_snapshot, asset_item:, recorded_on: Date.today)
    duplicate_snapshot = build(:asset_snapshot, asset_item:, recorded_on: Date.today)

    expect(duplicate_snapshot).not_to be_valid
    expect(duplicate_snapshot.errors[:recorded_on]).to include("has already been taken")
  end
end
