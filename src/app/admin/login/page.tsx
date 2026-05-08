"use client";

import { useFormState } from "react-dom";
import { loginAdmin } from "../actions";

const initialState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAdmin, initialState);

  return (
    <div className="mx-auto max-w-md rounded bg-[var(--water-deep)] p-6">
      <h1 className="serif-title mb-4 text-2xl font-bold">管理画面ログイン</h1>
      <form action={formAction} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" className="field-dark w-full p-2" />
        <input name="password" type="password" required placeholder="Password" className="field-dark w-full p-2" />
        {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
        <button className="w-full rounded bg-[var(--teal)] px-4 py-2 text-white">ログイン</button>
      </form>
    </div>
  );
}

