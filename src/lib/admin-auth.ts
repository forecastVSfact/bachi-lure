import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * 管理操作(Server Actions)の冒頭で呼ぶ。
 * - 未ログインなら /admin/login へリダイレクト
 * - 環境変数 ADMIN_EMAILS(カンマ区切り)が設定されている場合は、そのメールのユーザーだけ許可
 *   (未設定の場合は「ログイン済みであること」だけを確認する)
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/admin/login");

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length > 0 && !allowed.includes((user.email ?? "").toLowerCase())) {
    redirect("/admin/login");
  }

  return user;
}
