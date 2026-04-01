module Api
  module V1
    class AssetSnapshotsController < ApplicationController
      before_action :set_asset_snapshot, only: %i[update destroy]

      def index
        snapshots = current_user.asset_snapshots.includes(:asset_item).recent
        snapshots = snapshots.where(asset_item_id: params[:asset_item_id]) if params[:asset_item_id].present?
        render json: snapshots
      end

      def create
        asset_item = current_user.asset_items.find(snapshot_params[:asset_item_id])
        snapshot = asset_item.asset_snapshots.find_or_initialize_by(recorded_on: snapshot_params[:recorded_on])
        status = snapshot.new_record? ? :created : :ok

        snapshot.assign_attributes(snapshot_params.except(:asset_item_id))

        if snapshot.save
          render json: snapshot, status: status
        else
          render_errors(snapshot)
        end
      rescue ActiveRecord::RecordNotFound
        render_error("資産項目が見つかりません", status: :not_found)
      end

      def update
        if @asset_snapshot.update(snapshot_update_params)
          render json: @asset_snapshot
        else
          render_errors(@asset_snapshot)
        end
      end

      def destroy
        @asset_snapshot.destroy
        head :no_content
      end

      def bulk_create
        batch = batch_params
        items = batch[:items].presence || []

        if items.empty?
          return render_error("記録対象の資産項目がありません")
        end

        snapshots = []

        ActiveRecord::Base.transaction do
          items.each do |item|
            asset_item = current_user.asset_items.find(item[:asset_item_id])
            snapshot = asset_item.asset_snapshots.find_or_initialize_by(recorded_on: batch[:recorded_on])
            snapshot.assign_attributes(
              amount: item[:amount],
              note: item[:note].presence || batch[:note]
            )
            snapshot.save!
            snapshots << snapshot
          end
        end

        render json: snapshots.sort_by { |snapshot| [snapshot.recorded_on, snapshot.id] }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render_errors(e.record)
      rescue ActiveRecord::RecordNotFound
        render_error("資産項目が見つかりません", status: :not_found)
      end

      private

      def set_asset_snapshot
        @asset_snapshot = current_user.asset_snapshots.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render_error("資産記録が見つかりません", status: :not_found)
      end

      def snapshot_params
        params.require(:asset_snapshot).permit(:asset_item_id, :amount, :recorded_on, :note)
      end

      def snapshot_update_params
        params.require(:asset_snapshot).permit(:amount, :recorded_on, :note)
      end

      def batch_params
        params.require(:asset_snapshot_batch).permit(:recorded_on, :note, items: %i[asset_item_id amount note])
      end
    end
  end
end
