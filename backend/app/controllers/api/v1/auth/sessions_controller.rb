module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json
        skip_before_action :verify_signed_out_user, only: :destroy

        def destroy
          request.session_options[:skip] = true
          super
        end

        private

        def respond_with(resource, _opts = {})
          render json: {
            message: "ログインしました",
            data: {
              id:         resource.id,
              email:      resource.email,
              name:       resource.name,
              created_at: resource.created_at,
            },
          }, status: :ok
        end

        def respond_to_on_destroy(_options = {})
          render json: { message: "ログアウトしました" }, status: :ok
        end

      end
    end
  end
end
