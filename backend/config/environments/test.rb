require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = false
  config.public_file_server.headers = { "Cache-Control" => "public, max-age=#{1.hour.to_i}" }
  config.cache_store = :null_store
  config.active_storage.service = :test
  config.action_mailer.perform_caching = false
  config.active_support.deprecation = :stderr
  config.active_record.migration_error = :page_load
  config.action_mailer.delivery_method = :test
end
