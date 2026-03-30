class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :transactions, dependent: :destroy
  has_many :memos,        dependent: :destroy
  has_many :user_files,   dependent: :destroy

  validates :name, presence: true
end
