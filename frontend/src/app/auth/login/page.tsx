"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { getApiErrorMessage } from "@/lib/api";
import { extractBearerToken, getPostAuthRedirectPath } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import type { AuthResponse } from "@/types";

const schema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(6, "パスワードは6文字以上"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const r = await api.post<AuthResponse>(
        "/auth/sign_in",
        { user: data },
        { skipAuthRedirect: true }
      );
      const token = extractBearerToken(r.headers["authorization"]);

      if (!token) {
        throw new Error("認証トークンを取得できませんでした");
      }

      setSession(r.data.data, token);
      router.replace(getPostAuthRedirectPath(searchParams.get("next")));
    } catch (error) {
      setError("root", {
        message: getApiErrorMessage(error, "メールアドレスまたはパスワードが正しくありません"),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-8 sm:p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center sm:mb-8">
          <span className="font-display text-3xl font-bold text-brand-600">LifeHub</span>
          <p className="mt-2 text-sm text-slate-500">ログインして続ける</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{errors.root.message}</p>
            )}
            <div>
              <label className="label">メールアドレス</label>
              <input className="input" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">パスワード</label>
              <input className="input" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center mt-2">
              {isSubmitting ? "ログイン中..." : "ログイン"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            アカウントがない場合は{" "}
            <Link href="/auth/register" className="text-brand-600 hover:underline font-medium">新規登録</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
