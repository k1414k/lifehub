require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module LifehubBackend
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true

    config.time_zone = "Tokyo"
    config.active_record.default_timezone = :local

    config.active_storage.variant_processor = :mini_magick

    config.action_controller.default_url_options = {
      host: ENV.fetch("RAILS_HOST", "localhost"),
      port: ENV.fetch("PORT", "3001"),
    }
  end
end
