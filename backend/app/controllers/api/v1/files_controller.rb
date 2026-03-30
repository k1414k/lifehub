module Api
  module V1
    class FilesController < ApplicationController
      before_action :set_file, only: %i[destroy]

      def index
        files = current_user.user_files.order(created_at: :desc)
        render json: files.map { |f| serialize_file(f) }
      end

      def create
        user_file = current_user.user_files.build
        user_file.file.attach(params.dig(:file, :file) || params[:file])

        if user_file.save
          render json: serialize_file(user_file), status: :created
        else
          render_errors(user_file)
        end
      end

      def destroy
        @user_file.file.purge
        @user_file.destroy
        head :no_content
      end

      private

      def set_file
        @user_file = current_user.user_files.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("ファイルが見つかりません", status: :not_found)
      end

      def serialize_file(f)
        {
          id:            f.id,
          original_name: f.original_name,
          content_type:  f.content_type,
          byte_size:     f.byte_size,
          url:           url_for(f.file),
          created_at:    f.created_at,
        }
      end
    end
  end
end
