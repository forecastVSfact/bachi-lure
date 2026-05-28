import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { AdminLureForm } from "@/components/AdminLureForm";
import { deleteColumn, deleteLure, logoutAdmin, upsertColumn, upsertLure } from "./actions";

export default async function AdminPage() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/admin/login");

  const admin = createSupabaseAdminClient();
  const [{ data: lures }, { data: columns }] = await Promise.all([
    admin.from("lures").select("*").order("updated_at", { ascending: false }),
    admin.from("columns").select("*").order("updated_at", { ascending: false })
  ]);

  return (
    <div className="space-y-8 rounded bg-[var(--water-mid)] p-5">
      <div className="flex items-center justify-between">
        <h1 className="serif-title text-3xl font-bold">Admin</h1>
        <form action={logoutAdmin}><button className="field-dark rounded px-4 py-2">Logout</button></form>
      </div>

      <section className="rounded bg-[var(--water-deep)] p-4">
        <h2 className="serif-title mb-3 text-xl font-bold">Lure form</h2>
        <AdminLureForm action={upsertLure} />
      </section>

      <section className="rounded bg-[var(--water-deep)] p-4">
        <h3 className="serif-title mb-2 font-bold">Lures</h3>
        <div className="space-y-2">
          {(lures ?? []).map((lure) => (
            <div key={lure.id} className="flex items-center justify-between rounded border border-[var(--border)] p-2 text-sm">
              <span>{lure.name} / {lure.maker}</span>
              <form action={deleteLure}><input type="hidden" name="id" value={lure.id} /><button className="rounded border border-[#c0392b] px-3 py-1 text-[#c0392b]">Delete</button></form>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded bg-[var(--water-deep)] p-4">
        <h2 className="serif-title mb-3 text-xl font-bold">Column form</h2>
        <form action={upsertColumn} className="grid gap-2">
          <input name="id" required placeholder="slug (例: about)" className="field-dark p-2" />
          <input name="title" required placeholder="title" className="field-dark p-2" />
          <input name="category" required placeholder="category" className="field-dark p-2" />
          <input name="meta_description" placeholder="meta description" className="field-dark p-2" />
          <input name="published_at" placeholder="2026-01-01T00:00:00+09:00" className="field-dark p-2" />
          <textarea name="body" required placeholder="markdown body" className="field-dark min-h-32 p-2" />
          <button className="rounded bg-[var(--teal)] px-4 py-2 text-white">Save</button>
        </form>
        <div className="mt-4 space-y-2">
          {(columns ?? []).map((column) => (
            <div key={column.id} className="flex items-center justify-between rounded border border-[var(--border)] p-2 text-sm">
              <span>{column.title}</span>
              <form action={deleteColumn}><input type="hidden" name="id" value={column.id} /><button className="rounded border border-[#c0392b] px-3 py-1 text-[#c0392b]">Delete</button></form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

