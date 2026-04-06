"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Moon, Palette, Shield, Trash2, UserRound } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api";
import {
  useResetRecords,
  useUpdatePassword,
  useUpdateProfile,
} from "@/hooks/useApi";
import { useActivityLogStore } from "@/stores/activityLogStore";
import {
  memoFontSizeOptions,
  usePreferencesStore,
} from "@/stores/preferencesStore";
import { useAuthStore } from "@/stores/authStore";
import type { RecordResetFeature } from "@/types";

const profileSchema = z.object({
  name: z.string().trim().min(1, "ニックネームを入力してください"),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "現在のパスワードを入力してください"),
    password: z.string().min(6, "新しいパスワードは6文字以上で入力してください"),
    password_confirmation: z.string().min(6, "確認用パスワードは6文字以上で入力してください"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "確認用パスワードが一致しません",
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const resetOptions: Array<{
  feature: RecordResetFeature;
  label: string;
  description: string;
  warning: string;
}> = [
  {
    feature: "assets",
    label: "資産管理を初期化",
    description: "資産項目と記録履歴をまとめて削除します。",
    warning:
      "注意: この操作を実行すると資産項目と記録履歴がすべて削除されます。本当に初期化しますか？",
  },
  {
    feature: "memos",
    label: "メモを初期化",
    description: "保存済みのメモと締切メモをすべて削除します。",
    warning:
      "注意: この操作を実行すると今までのメモがすべて削除されます。本当に初期化しますか？",
  },
  {
    feature: "files",
    label: "ファイルを初期化",
    description: "アップロード済みファイルをすべて削除します。",
    warning:
      "注意: この操作を実行すると今までのファイルがすべて削除されます。本当に初期化しますか？",
  },
];

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const theme = usePreferencesStore((state) => state.theme);
  const memoFontSize = usePreferencesStore((state) => state.memoFontSize);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setMemoFontSize = usePreferencesStore((state) => state.setMemoFontSize);
  const addActivity = useActivityLogStore((state) => state.addItem);

  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const resetRecords = useResetRecords();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    resetProfileForm({ name: user?.name ?? "" });
  }, [resetProfileForm, user?.name]);

  const onSubmitProfile = handleSubmitProfile(async (values) => {
    const response = await updateProfile.mutateAsync(values);
    setCurrentUser(response.data);
    addActivity("ニックネームを更新しました");
  });

  const onSubmitPassword = handleSubmitPassword(async (values) => {
    await updatePassword.mutateAsync(values);
    resetPasswordForm();
    addActivity("パスワードを変更しました");
  });

  const handleReset = async (feature: RecordResetFeature, warning: string) => {
    if (!window.confirm(warning)) return;

    const response = await resetRecords.mutateAsync(feature);
    addActivity(response.message);
    window.alert(response.message);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">
          設定
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          アカウント、表示、データ管理をここでまとめて変更できます。
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <UserRound size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                アカウント
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ログイン中の名前を変更します。
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmitProfile}>
            <div>
              <label className="label">ニックネーム</label>
              <input
                className="input"
                placeholder="表示名を入力"
                {...registerProfile("name")}
              />
              {profileErrors.name && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.name.message}</p>
              )}
            </div>
            <div>
              <label className="label">メールアドレス</label>
              <input
                className="input cursor-not-allowed opacity-70"
                value={user?.email ?? ""}
                disabled
                readOnly
              />
            </div>
            {updateProfile.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {getApiErrorMessage(updateProfile.error, "ニックネームの更新に失敗しました")}
              </p>
            )}
            {updateProfile.isSuccess && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                ニックネームを更新しました。
              </p>
            )}
            <button
              type="submit"
              disabled={isProfileSubmitting}
              className="btn-primary justify-center"
            >
              {isProfileSubmitting ? "更新中..." : "ニックネームを保存"}
            </button>
          </form>
        </section>

        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                セキュリティ
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                現在のパスワードを確認したうえで変更します。
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={onSubmitPassword}>
            <div>
              <label className="label">現在のパスワード</label>
              <input className="input" type="password" {...registerPassword("current_password")} />
              {passwordErrors.current_password && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordErrors.current_password.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">新しいパスワード</label>
                <input className="input" type="password" {...registerPassword("password")} />
                {passwordErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{passwordErrors.password.message}</p>
                )}
              </div>
              <div>
                <label className="label">確認用パスワード</label>
                <input
                  className="input"
                  type="password"
                  {...registerPassword("password_confirmation")}
                />
                {passwordErrors.password_confirmation && (
                  <p className="mt-1 text-xs text-red-500">
                    {passwordErrors.password_confirmation.message}
                  </p>
                )}
              </div>
            </div>
            {updatePassword.error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
                {getApiErrorMessage(updatePassword.error, "パスワードの更新に失敗しました")}
              </p>
            )}
            {updatePassword.isSuccess && (
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                パスワードを更新しました。
              </p>
            )}
            <button
              type="submit"
              disabled={isPasswordSubmitting}
              className="btn-primary justify-center"
            >
              {isPasswordSubmitting ? "更新中..." : "パスワードを変更"}
            </button>
          </form>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="card space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                表示設定
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                テーマとメモ本文の文字サイズを調整できます。
              </p>
            </div>
          </div>

          <div>
            <p className="label">テーマ</p>
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTheme("light");
                  addActivity("ライトモードに切り替えました");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  theme === "light"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                    : "text-slate-500 dark:text-slate-300"
                }`}
              >
                ライト
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme("dark");
                  addActivity("ダークモードに切り替えました");
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-slate-700"
                    : "text-slate-500 dark:text-slate-300"
                }`}
              >
                ダーク
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="label !mb-0">メモ本文サイズ</label>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                {memoFontSize}px
              </span>
            </div>
            <select
              value={memoFontSize}
              onChange={(event) => {
                setMemoFontSize(Number(event.target.value));
                addActivity(`メモ文字サイズを${event.target.value}pxに変更しました`);
              }}
              className="input"
            >
              {memoFontSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                プレビュー
              </p>
              <p
                className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300"
                style={{ fontSize: `${memoFontSize}px` }}
              >
                これは設定した本文サイズの見え方です。モバイル以外ではこのサイズが初期値になります。
              </p>
            </div>
          </div>
        </section>

        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-2.5 text-red-500 dark:bg-red-500/15 dark:text-red-300">
              <Trash2 size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                記録の初期化
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                必要な機能だけ個別に初期化できます。実行前に必ず確認します。
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {resetOptions.map((option) => (
              <div
                key={option.feature}
                className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={resetRecords.isPending}
                    onClick={() => void handleReset(option.feature, option.warning)}
                    className="inline-flex items-center justify-center rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resetRecords.isPending ? "初期化中..." : "初期化する"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {resetRecords.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {getApiErrorMessage(resetRecords.error, "初期化に失敗しました")}
            </p>
          )}

          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex items-start gap-3">
              <Moon size={18} className="mt-0.5 text-amber-600 dark:text-amber-300" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                注意: 初期化ボタンを押すと対象機能の記録がすべて削除され、元に戻せません。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
