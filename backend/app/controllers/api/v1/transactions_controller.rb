module Api
  module V1
    class TransactionsController < ApplicationController
      before_action :set_transaction, only: %i[update destroy]

      def index
        transactions = current_user.transactions.recent
        render json: transactions
      end

      def create
        transaction = current_user.transactions.build(transaction_params)
        if transaction.save
          render json: transaction, status: :created
        else
          render_errors(transaction)
        end
      end

      def update
        if @transaction.update(transaction_params)
          render json: @transaction
        else
          render_errors(@transaction)
        end
      end

      def destroy
        @transaction.destroy
        head :no_content
      end

      private

      def set_transaction
        @transaction = current_user.transactions.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("取引が見つかりません", status: :not_found)
      end

      def transaction_params
        params.require(:transaction).permit(:title, :amount, :transaction_type, :category, :date, :note)
      end
    end
  end
end
