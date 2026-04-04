require "rails_helper"

RSpec.describe Memo, type: :model do
  subject(:memo) { build(:memo) }

  it { should belong_to(:user) }
  it { should validate_presence_of(:title) }
  it { should validate_inclusion_of(:memo_type).in_array(%w[normal deadline]) }

  describe "deadline validation" do
    it "is valid for a normal memo without deadline_at" do
      expect(build(:memo, memo_type: "normal", deadline_at: nil)).to be_valid
    end

    it "requires deadline_at for deadline memo" do
      memo = build(:memo, memo_type: "deadline", deadline_at: nil)

      expect(memo).not_to be_valid
      expect(memo.errors[:deadline_at]).to include("can't be blank")
    end

    it "does not allow deadline_at for normal memo" do
      memo = build(:memo, memo_type: "normal", deadline_at: 1.day.from_now)

      expect(memo).not_to be_valid
      expect(memo.errors[:deadline_at]).to include("must be blank")
    end
  end

  describe ".deadline_only" do
    it "returns only deadline memos" do
      deadline_memo = create(:memo, :deadline)
      create(:memo)

      expect(described_class.deadline_only).to contain_exactly(deadline_memo)
    end
  end

  describe ".deadline_first" do
    it "orders deadline memos by nearest deadline" do
      later = create(:memo, :deadline, deadline_at: 3.days.from_now)
      sooner = create(:memo, :deadline, deadline_at: 1.day.from_now)

      expect(described_class.deadline_only.deadline_first).to eq([sooner, later])
    end
  end
end
