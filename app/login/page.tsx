"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithDemo, loginWithCredentials, loginAsGuest, DEMO_ACCOUNTS } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState<string | null>(null);

  function after() { router.replace("/"); }

  function handleDemo(id: string) {
    setLoading(id);
    loginWithDemo(id);
    after();
  }

  function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const user = loginWithCredentials(email, password);
    if (!user) { setError("Invalid email or password. Try a demo account!"); return; }
    after();
  }

  function handleGuest() {
    setLoading("guest");
    loginAsGuest();
    after();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="text-3xl font-bold text-white">AiCoax</h1>
          <p className="text-slate-400 mt-1 text-sm">Your mental health companion</p>
        </div>

        {/* Demo accounts */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Quick demo accounts</p>
          <div className="space-y-3">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.id}
                onClick={() => handleDemo(acc.id)}
                disabled={loading !== null}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left disabled:opacity-60"
              >
                <span className="text-2xl">{acc.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{acc.name}</p>
                  <p className="text-slate-400 text-xs truncate">{acc.bio}</p>
                </div>
                {loading === acc.id ? (
                  <div className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
                ) : (
                  <span className="text-slate-600 text-xs">→</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Email/Password */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Sign in with email</p>
          <form onSubmit={handleCredentials} className="space-y-3">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-sm font-medium transition-colors"
            >
              Sign in
            </button>
          </form>
          <p className="text-slate-600 text-xs mt-3 text-center">
            Demo: arjun@demo.com / demo123
          </p>
        </div>

        {/* Guest */}
        <button
          onClick={handleGuest}
          disabled={loading !== null}
          className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 transition-colors disabled:opacity-60"
        >
          {loading === "guest" ? "Entering..." : "Continue as guest ✨"}
        </button>
      </div>
    </div>
  );
}
