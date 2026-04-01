module Api
  module V1
    class AssetsController < ApplicationController
      before_action :set_asset_item, only: %i[update destroy]

      def index
        render json: current_user.asset_items.alphabetical
      end

      def create
        asset_item = current_user.asset_items.build(asset_params)

        if asset_item.save
          render json: asset_item, status: :created
        else
          render_errors(asset_item)
        end
      end

      def update
        if @asset_item.update(asset_params)
          render json: @asset_item
        else
          render_errors(@asset_item)
        end
      end

      def destroy
        @asset_item.destroy
        head :no_content
      end

      private

      def set_asset_item
        @asset_item = current_user.asset_items.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("資産項目が見つかりません", status: :not_found)
      end

      def asset_params
        params.require(:asset).permit(:name, :description)
      end
    end
  end
end
