
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";

import { loginUser } from "@/lib/api/auth";
import {
  saveAccessToken,
  saveRefreshToken,
} from "@/lib/auth/session";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRegistered(params.get("registered") === "1");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const tokens = await loginUser(username.trim(), password);

      // Save both JWT tokens for authentication and renewal.
      saveAccessToken(tokens.access);
      saveRefreshToken(tokens.refresh);

      router.replace("/game");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08131a] px-5 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-4 text-5xl">🌆</div>

          <h1 className="text-4xl font-black tracking-tight">
            ACCRA <span className="text-emerald-400">LIFE</span>
          </h1>

          <p className="mt-2 text-sm tracking-[0.3em] text-slate-400">
            MINI EDITION
          </p>

          <p className="mt-5 text-slate-300">
            Accra is calling. Your hustle starts here.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl"
        >
          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>

            <p className="mt-1 text-sm text-slate-400">
              Sign in to continue your journey.
            </p>
          </div>

          {registered && (
            <div
              role="status"
              className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
            >
              Account created successfully! Sign in to enter Accra Life.
            </div>
          )}

          <div>
            <label htmlFor="username" className="mb-2 block text-sm">
              Username
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
              <UserRound size={18} className="shrink-0 text-slate-400" />

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                placeholder="Enter your username"
                className="min-w-0 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
              <LockKeyhole size={18} className="shrink-0 text-slate-400" />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword((event.target as HTMLInputElement).value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="min-w-0 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="shrink-0 cursor-pointer text-slate-400 transition hover:text-emerald-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 font-bold text-[#08131a] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter the City"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-sm text-slate-400">
            New to the city?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
