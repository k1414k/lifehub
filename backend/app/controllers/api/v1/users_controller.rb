module Api
  module V1
    class UsersController < ApplicationController
      def me
        render json: user_payload(current_user)
      end

      def update
        if current_user.update(profile_params)
          render json: {
            message: "アカウント情報を更新しました",
            data: user_payload(current_user),
          }
        else
          render_errors(current_user)
        end
      end

      def update_password
        unless current_user.valid_password?(password_update_params[:current_password].to_s)
          return render_error("現在のパスワードが正しくありません")
        end

        if current_user.update(password_params)
          render json: { message: "パスワードを更新しました" }
        else
          render_errors(current_user)
        end
      end

      private

      def user_payload(user)
        {
          id: user.id,
          email: user.email,
          name: user.name,
          created_at: user.created_at,
        }
      end

      def profile_params
        params.require(:user).permit(:name)
      end

      def password_update_params
        params.require(:user).permit(:current_password, :password, :password_confirmation)
      end

      def password_params
        password_update_params.except(:current_password)
      end
    end
  end
end
