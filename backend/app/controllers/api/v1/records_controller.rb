module Api
  module V1
    class RecordsController < ApplicationController
      RESET_MESSAGES = {
        "assets" => "資産項目と記録履歴を初期化しました",
        "memos" => "メモを初期化しました",
        "files" => "ファイルを初期化しました",
        "transactions" => "旧お金記録を初期化しました",
      }.freeze

      def destroy
        feature = params[:feature].to_s

        ActiveRecord::Base.transaction do
          case feature
          when "assets"
            current_user.asset_items.destroy_all
          when "memos"
            current_user.memos.destroy_all
          when "files"
            current_user.user_files.find_each do |user_file|
              user_file.file.purge if user_file.file.attached?
              user_file.destroy!
            end
          when "transactions"
            current_user.transactions.destroy_all
          else
            return render_error("初期化対象が不正です", status: :not_found)
          end
        end

        render json: { message: RESET_MESSAGES.fetch(feature) }
      end
    end
  end
end
