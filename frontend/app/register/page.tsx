
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";

import { registerUser } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      router.push("/login?registered=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08131a] px-5 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
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
            <h2 className="text-2xl font-bold">
              Create your account
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Start your journey in Accra.
            </p>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="mb-2 block text-sm">
              Username
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
              <UserRound size={18} className="shrink-0 text-slate-400" />

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                minLength={3}
                autoComplete="username"
                placeholder="Choose a username"
                className="min-w-0 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              Email address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
              <Mail size={18} className="shrink-0 text-slate-400" />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="min-w-0 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
              <LockKeyhole size={18} className="shrink-0 text-slate-400" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Create a password"
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm">
              Confirm password
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
              <LockKeyhole size={18} className="shrink-0 text-slate-400" />

              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
                placeholder="Confirm your password"
                className="min-w-0 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
                className="shrink-0 cursor-pointer text-slate-400 transition hover:text-emerald-400"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
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
            {loading ? "Creating account..." : "Create Account"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
