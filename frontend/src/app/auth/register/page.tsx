"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  name: z.string().min(1, "名前は必須です"),
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(6, "パスワードは6文字以上"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "パスワードが一致しません",
  path: ["password_confirmation"],
});
type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const r = await api.post("/auth", { user: data });
      const token = r.headers["authorization"]?.replace("Bearer ", "");
      setUser(r.data.data, token);
      if (token) localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch {
      setError("root", { message: "登録に失敗しました。既に使用されているメールアドレスかもしれません。" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display font-bold text-3xl text-brand-600">LifeHub</span>
          <p className="text-slate-500 text-sm mt-2">アカウントを作成</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{errors.root.message}</p>
            )}
            <div>
              <label className="label">名前</label>
              <input className="input" placeholder="山田 太郎" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
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
            <div>
              <label className="label">パスワード確認</label>
              <input className="input" type="password" placeholder="••••••••" {...register("password_confirmation")} />
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center mt-2">
              {isSubmitting ? "作成中..." : "アカウント作成"}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">
            既にアカウントをお持ちの場合は{" "}
            <Link href="/auth/login" className="text-brand-600 hover:underline font-medium">ログイン</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
