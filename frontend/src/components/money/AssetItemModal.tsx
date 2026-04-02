"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import { useCreateAsset, useUpdateAsset } from "@/hooks/useApi";
import type { AssetItem } from "@/types";

const schema = z.object({
  name: z.string().min(1, "資産項目名は必須です"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  asset: AssetItem | null;
  onClose: () => void;
}

export default function AssetItemModal({ open, asset, onClose }: Props) {
  const createMutation = useCreateAsset();
  const updateMutation = useUpdateAsset();
  const mutation = asset ? updateMutation : createMutation;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      name: asset?.name ?? "",
      description: asset?.description ?? "",
    });
  }, [asset, open, reset]);

  const onSubmit = async (values: FormValues) => {
    if (asset) {
      await updateMutation.mutateAsync({
        id: asset.id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    reset({
      name: "",
      description: "",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-800">
              {asset ? "資産項目を編集" : "資産項目を追加"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              現金や株式のような保有資産を自由に管理できます
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 sm:p-6">
          <div>
            <label className="label">資産項目名</label>
            <input className="input" placeholder="例：現金、スマホ、株式" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">説明（任意）</label>
            <textarea
              className="input"
              rows={3}
              placeholder="保管場所や評価の基準など"
              {...register("description")}
            />
          </div>

          {mutation.error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {getApiErrorMessage(mutation.error)}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
              キャンセル
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? "保存中..." : asset ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
