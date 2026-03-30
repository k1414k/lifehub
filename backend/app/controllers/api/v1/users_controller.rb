module Api
  module V1
    class UsersController < ApplicationController
      def me
        render json: {
          id:         current_user.id,
          email:      current_user.email,
          name:       current_user.name,
          created_at: current_user.created_at,
        }
      end
    end
  end
end
