require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module LifehubBackend
  class Application < Rails::Application
    def self.build_port_option
      port = ENV.fetch("RAILS_PUBLIC_PORT", ENV.fetch("PORT", "3001"))
      protocol = ENV.fetch("RAILS_PROTOCOL", "http")

      return {} if (protocol == "https" && port == "443") || (protocol == "http" && port == "80")

      { port: port }
    end
    private_class_method :build_port_option

    config.load_defaults 7.2
    config.api_only = true

    config.time_zone = "Tokyo"
    config.active_record.default_timezone = :local

    config.active_storage.variant_processor = :mini_magick

    config.action_controller.default_url_options = {
      host: ENV.fetch("RAILS_HOST", "localhost"),
      protocol: ENV.fetch("RAILS_PROTOCOL", "http"),
    }.merge(build_port_option)
  end
end
