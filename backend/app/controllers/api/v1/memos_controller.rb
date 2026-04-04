module Api
  module V1
    class MemosController < ApplicationController
      before_action :set_memo, only: %i[show update destroy]

      def index
        memos = current_user.memos.pinned_first
        memos = memos.search(params[:q]) if params[:q].present?
        render json: memos
      end

      def show
        render json: @memo
      end

      def create
        memo = current_user.memos.build(memo_params)
        if memo.save
          render json: memo, status: :created
        else
          render_errors(memo)
        end
      end

      def update
        if @memo.update(memo_params)
          render json: @memo
        else
          render_errors(@memo)
        end
      end

      def destroy
        @memo.destroy
        head :no_content
      end

      private

      def set_memo
        @memo = current_user.memos.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("メモが見つかりません", status: :not_found)
      end

      def memo_params
        params.require(:memo).permit(:title, :content, :pinned, :memo_type, :deadline_at, tags: [])
      end
    end
  end
end
