
"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const invalidLink = !uid || !token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (invalidLink) {
      setError("This password reset link is invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          token,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        if (response.status === 429) {
          throw new Error("Too many attempts. Please try again later.");
        }

        if (Array.isArray(data?.password)) {
          throw new Error(data.password.join(" "));
        }

        throw new Error(
          data?.error || "Unable to reset your password. Please try again.",
        );
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
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
            Get back to your hustle.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          {success ? (
            <div className="space-y-5 text-center" role="status">
              <CheckCircle2
                size={48}
                className="mx-auto text-emerald-400"
              />

              <h2 className="text-2xl font-bold">
                Password reset successful!
              </h2>

              <p className="text-sm leading-6 text-slate-300">
                Your password has been updated. You can now log in
                and continue your Accra Life journey.
              </p>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 font-bold text-[#08131a] hover:bg-emerald-300"
              >
                Go to Login
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : invalidLink ? (
            <div className="space-y-5 text-center">
              <h2 className="text-2xl font-bold">
                Invalid reset link
              </h2>

              <p className="text-sm text-slate-300">
                This link is incomplete. Request a new password
                reset email to continue.
              </p>

              <Link
                href="/forgot-password"
                className="block rounded-xl bg-emerald-400 py-4 font-bold text-[#08131a] hover:bg-emerald-300"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Create new password
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Choose a secure password for your account.
                </p>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm">
                  New Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
                  <LockKeyhole size={18} className="text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="min-w-0 w-full bg-transparent py-4 outline-none placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="text-slate-400 hover:text-emerald-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm">
                  Confirm New Password
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
                  <LockKeyhole size={18} className="text-slate-400" />

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="min-w-0 w-full bg-transparent py-4 outline-none placeholder:text-slate-500"
                  />
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 font-bold text-[#08131a] hover:bg-emerald-300 disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
                {!loading && <ArrowRight size={18} />}
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#08131a]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
