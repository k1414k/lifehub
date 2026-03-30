require "rails_helper"

RSpec.describe Transaction, type: :model do
  it { should belong_to(:user) }
  it { should validate_presence_of(:title) }
  it { should validate_presence_of(:amount) }
  it { should validate_presence_of(:category) }
  it { should validate_presence_of(:date) }
  it { should validate_numericality_of(:amount).is_greater_than(0) }
end
