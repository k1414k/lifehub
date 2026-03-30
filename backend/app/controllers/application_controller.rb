class ApplicationController < ActionController::API
  before_action :authenticate_user!

  include Rails.application.routes.url_helpers

  def default_url_options
    { host: ENV.fetch("RAILS_HOST", "localhost"), port: ENV.fetch("PORT", 3001) }
  end

  private

  def render_error(message, status: :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_errors(record, status: :unprocessable_entity)
    render json: { error: record.errors.full_messages.join(", ") }, status: status
  end
end
