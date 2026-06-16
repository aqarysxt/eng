"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { Cabinet } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen, Spinner } from "@/components/ui/Spinner";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const loadCabinets = useCallback(async (userId: string) => {
    try {
      const { cabinets } = await api.getCabinets(userId);
      setCabinets(cabinets);
    } catch {
      // тізім бос болса да бетті көрсетеміз
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    loadCabinets(current.id);
  }, [router, loadCabinets]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setCreateError("");
    if (newName.trim().length < 1) {
      setCreateError("Кабинет атауын енгізіңіз.");
      return;
    }
    setCreating(true);
    try {
      const { cabinet } = await api.createCabinet(newName.trim(), user.id);
      router.push(`/cabinet/${cabinet.id}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Қате болды.");
      setCreating(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setJoinError("");
    if (joinCode.trim().length < 1) {
      setJoinError("Кабинет кодын енгізіңіз.");
      return;
    }
    setJoining(true);
    try {
      const { cabinet } = await api.joinCabinet(joinCode.trim(), user.id);
      router.push(`/cabinet/${cabinet.id}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Кабинет табылмады.");
      setJoining(false);
    }
  }

  if (!user) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      <TopBar user={user} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Сәлем, {user.full_name} 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            Жаңа кабинет ашыңыз немесе код арқылы бар кабинетке кіріңіз.
          </p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="mb-1 text-base font-semibold text-slate-900">Жаңа кабинет ашу</h2>
            <p className="mb-4 text-sm text-slate-500">Өзіңіздің сөздік кабинетіңізді құрыңыз.</p>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input
                name="cabinetName"
                placeholder="Кабинет атауы"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              {createError && <Alert tone="error">{createError}</Alert>}
              <Button type="submit" className="w-full" loading={creating}>
                Жаңа кабинет ашу
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="mb-1 text-base font-semibold text-slate-900">Кабинетке кіру</h2>
            <p className="mb-4 text-sm text-slate-500">Сізге берілген 6 таңбалы кодты енгізіңіз.</p>
            <form onSubmit={handleJoin} className="space-y-3">
              <Input
                name="cabinetCode"
                placeholder="Мысалы: A7KQ92"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="uppercase tracking-widest"
                maxLength={6}
              />
              {joinError && <Alert tone="error">{joinError}</Alert>}
              <Button type="submit" variant="secondary" className="w-full" loading={joining}>
                Кабинетке кіру
              </Button>
            </form>
          </Card>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Менің кабинеттерім</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-7 w-7" />
            </div>
          ) : cabinets.length === 0 ? (
            <EmptyState
              icon="🗂️"
              title="Әзірге кабинет жоқ"
              description="Жоғарыдан жаңа кабинет ашыңыз немесе код арқылы кіріңіз."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cabinets.map((cabinet) => (
                <Link key={cabinet.id} href={`/cabinet/${cabinet.id}`}>
                  <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{cabinet.name}</h3>
                      <span className="rounded-lg bg-brand-50 px-2 py-1 font-mono text-xs font-semibold tracking-widest text-brand-700">
                        {cabinet.code}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-brand-600">Кабинетке өту →</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
