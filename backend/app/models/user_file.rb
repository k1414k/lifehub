class UserFile < ApplicationRecord
  belongs_to :user
  has_one_attached :file

  validates :file, presence: true

  def original_name
    file.filename.to_s
  end

  def content_type
    file.content_type
  end

  def byte_size
    file.byte_size
  end

  def url
    Rails.application.routes.url_helpers.rails_blob_url(file, only_path: false)
  end
end
