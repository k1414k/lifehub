module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            message: "ログインしました",
            data: {
              id:    resource.id,
              email: resource.email,
              name:  resource.name,
            },
          }, status: :ok
        end

        def respond_to_on_destroy
          if request.headers["Authorization"].present?
            render json: { message: "ログアウトしました" }, status: :ok
          else
            render json: { message: "トークンが見つかりません" }, status: :unauthorized
          end
        end
      end
    end
  end
end
