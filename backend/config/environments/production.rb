require "active_support/core_ext/integer/time"
require "uri"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.log_level = :info
  config.log_tags = [:request_id]
  config.force_ssl = true
  config.active_storage.service = :amazon
  config.active_support.report_deprecations = false
  config.active_record.dump_schema_after_migration = false

  allowed_hosts = [ENV["RAILS_HOST"]]

  frontend_hosts = ENV.fetch("FRONTEND_ORIGIN", "")
    .split(",")
    .map(&:strip)
    .filter_map do |origin|
      next if origin.blank?

      URI.parse(origin).host
    rescue URI::InvalidURIError
      nil
    end

  (allowed_hosts + frontend_hosts).uniq.each do |host|
    config.hosts << host if host.present?
  end
end
