import { type FormEvent, useState } from "react";
import PasswordInput from "./PasswordInput";

interface LoginFormState {
  username: string;
  password: string;
}

interface AdminLoginFormProps {
  loginForm: LoginFormState;
  loginError: string;
  onChange: (field: keyof LoginFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function AdminLoginForm({
  loginForm,
  loginError,
  onChange,
  onSubmit,
}: AdminLoginFormProps) {
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Masuk</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input
              name="username"
              autoComplete="off"
              value={loginForm.username}
              onChange={(e) => onChange("username", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 transition focus:border-[var(--pine)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <PasswordInput
              name="password"
              value={loginForm.password}
              onChange={(value) => onChange("password", value)}
              isVisible={showLoginPassword}
              onToggleVisibility={() => setShowLoginPassword((visible) => !visible)}
            />
          </div>

          {loginError && <p className="text-sm text-red-600">{loginError}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--pine)] px-4 py-3 font-semibold text-white transition hover:brightness-95"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
