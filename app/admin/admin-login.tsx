"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password.trim() || busy) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not authenticate.");
      }

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not open the admin studio.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(143,131,255,0.26),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(53,227,177,0.14),transparent_26%),linear-gradient(180deg,var(--bg),color-mix(in srgb,var(--bg)_78%,#060913))] px-4 py-10 text-[var(--text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-panel-strong overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full chip px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--text-soft)]">
              Studio Access
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Open the Nexvora content studio.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
              Sign in to edit the homepage, manage services, publish drafts, and keep the live site synced with Supabase.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Drafts", "Edit before publish"],
                ["Sync", "Supabase backed"],
                ["Preview", "Live visual canvas"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[1.4rem] surface-panel p-4">
                  <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-[var(--text-soft)]">{copy}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-panel-strong rounded-[2rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.28em] text-[var(--accent-2)]">
                  Admin Login
                </div>
                <h2 className="mt-2 text-2xl font-semibold">Enter the studio</h2>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]" />
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text-soft)]">
                  Admin Secret
                </label>
                <input
                  type="password"
                  className="field"
                  placeholder="Enter the secret from your env file"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Authenticating..." : "Open Studio"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
