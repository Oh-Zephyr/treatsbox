"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoMark } from "../../components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect username or password.");
        setLoading(false);
        return;
      }
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <LogoMark className="w-10 h-10 mx-auto mb-3" />
        <p className="font-display text-2xl font-semibold text-ink text-center mb-1">Treatsbox</p>
        <p className="text-sm text-ink2 text-center mb-8">Admin sign in</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl2 shadow-card p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-ink block mb-1.5">Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="tb-input" autoFocus />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-ink block mb-1.5">Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="tb-input" />
          </label>
          {error && <p className="text-sm text-alert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-oxblood text-white font-semibold py-3 shadow-pop disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="text-xs text-ink2/60 text-center mt-4">Demo credentials: admin / treatsbox2026</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
