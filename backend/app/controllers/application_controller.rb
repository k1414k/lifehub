class ApplicationController < ActionController::API
  before_action :authenticate_user!

  include Rails.application.routes.url_helpers

  def default_url_options
    {
      host: ENV.fetch("RAILS_HOST", "localhost"),
      protocol: ENV.fetch("RAILS_PROTOCOL", "http"),
    }.merge(default_port_option)
  end

  private

  def default_port_option
    port = ENV.fetch("RAILS_PUBLIC_PORT", ENV.fetch("PORT", "3001"))
    protocol = ENV.fetch("RAILS_PROTOCOL", "http")

    return {} if (protocol == "https" && port == "443") || (protocol == "http" && port == "80")

    { port: port }
  end

  def render_error(message, status: :unprocessable_entity)
    render json: { error: message }, status: status
  end

  def render_errors(record, status: :unprocessable_entity)
    render json: { error: record.errors.full_messages.join(", ") }, status: status
  end
end
