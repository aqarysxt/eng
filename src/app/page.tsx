"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getCurrentUser, saveCurrentUser } from "@/lib/currentUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/Spinner";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // localStorage-те қолданушы болса — бірден dashboard-қа
  useEffect(() => {
    if (getCurrentUser()) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 2) {
      setError("Аты-жөніңізді толық енгізіңіз.");
      return;
    }

    setSubmitting(true);
    try {
      const { user } = await api.createUser(fullName.trim());
      saveCurrentUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Қате болды.");
      setSubmitting(false);
    }
  }

  if (checking) return <LoadingScreen />;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-4 py-10">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-200/40 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-soft">
            W
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">WordRoom</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
            Сөздерді тақырып бойынша енгізіп, ойын режимдері арқылы жатта.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-card"
        >
          <Input
            label="Аты-жөніңіз"
            name="fullName"
            placeholder="Мысалы: Айбек Серіков"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoFocus
            autoComplete="name"
          />

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            Кіру
          </Button>

          <p className="text-center text-xs text-slate-400">
            Email де, құпиясөз де қажет емес — тек атыңыз.
          </p>
        </form>
      </div>
    </main>
  );
}
