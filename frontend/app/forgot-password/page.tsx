
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Too many requests. Please try again later.");
        }

        throw new Error("Unable to send reset email. Please try again.");
      }

      setSuccess(true);
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
            Every hustler deserves a second chance.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          {success ? (
            <div className="space-y-5 text-center" role="status">
              <CheckCircle2
                size={48}
                className="mx-auto text-emerald-400"
              />

              <h2 className="text-2xl font-bold">Check your email</h2>

              <p className="text-sm leading-6 text-slate-300">
                If an account exists with that email address,
                you will receive a link to reset your password.
              </p>

              <p className="text-sm text-slate-400">
                Don't forget to check your spam folder.
              </p>

              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 font-bold text-[#08131a] transition hover:bg-emerald-300"
              >
                <ArrowLeft size={18} />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">
                  Forgot your password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Enter the email address associated with your
                  Accra Life Mini account. We'll send you a
                  password-reset link.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm">
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101e27] px-4">
                  <Mail size={18} className="shrink-0 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="min-w-0 w-full bg-transparent py-4 text-white outline-none placeholder:text-slate-500"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-4 font-bold text-[#08131a] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Reset Link"}
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
