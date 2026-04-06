Rails.application.routes.draw do
  # Devise / JWT
  devise_for :users,
    path: "api/v1/auth",
    path_names: { sign_in: "sign_in", sign_out: "sign_out", registration: "" },
    controllers: {
      sessions:      "api/v1/auth/sessions",
      registrations: "api/v1/auth/registrations",
    }

  namespace :api do
    namespace :v1 do
      # User info
      get  "me", to: "users#me"
      patch "me", to: "users#update"
      patch "me/password", to: "users#update_password"
      delete "records/:feature", to: "records#destroy"

      # Assets
      resources :assets, only: %i[index create update destroy]
      resources :asset_snapshots, only: %i[index create update destroy] do
        collection do
          post :bulk_create
        end
      end

      # Legacy money
      resources :transactions, only: %i[index create update destroy]

      # Memos
      resources :memos, only: %i[index show create update destroy]

      # Files
      resources :files, only: %i[index create destroy]
    end
  end

  # Health check
  get "up", to: proc { [200, {}, ["OK"]] }
end
