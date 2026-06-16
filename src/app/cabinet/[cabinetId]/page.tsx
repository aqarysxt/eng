"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { Cabinet, Topic } from "@/lib/types";
import { wordCountLabel } from "@/lib/utils";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/Spinner";

export default function CabinetPage() {
  const router = useRouter();
  const params = useParams<{ cabinetId: string }>();
  const cabinetId = params.cabinetId;

  const [user, setUser] = useState<StoredUser | null>(null);
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = useCallback(async () => {
    try {
      const [{ cabinet }, { topics }] = await Promise.all([
        api.getCabinet(cabinetId),
        api.getTopics(cabinetId),
      ]);
      setCabinet(cabinet);
      setTopics(topics);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Кабинетті жүктеу мүмкін болмады.");
    } finally {
      setLoading(false);
    }
  }, [cabinetId]);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    load();
  }, [router, load]);

  async function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (title.trim().length < 1) {
      setCreateError("Тақырып атауын енгізіңіз.");
      return;
    }
    setCreating(true);
    try {
      const { topic } = await api.createTopic(cabinetId, title.trim(), description.trim());
      setTopics((prev) => [topic, ...prev]);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      router.push(`/cabinet/${cabinetId}/topic/${topic.id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Қате болды.");
    } finally {
      setCreating(false);
    }
  }

  if (!user || loading) return <LoadingScreen />;

  if (loadError || !cabinet) {
    return (
      <div className="min-h-screen">
        <TopBar user={user} backHref="/dashboard" backLabel="Басты бет" />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <Alert tone="error">{loadError || "Кабинет табылмады."}</Alert>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button variant="secondary">Басты бетке оралу</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar user={user} backHref="/dashboard" backLabel="Басты бет" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{cabinet.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-slate-500">Кабинет коды:</span>
              <span className="rounded-lg bg-brand-50 px-3 py-1 font-mono text-sm font-semibold tracking-widest text-brand-700">
                {cabinet.code}
              </span>
              <CopyButton value={cabinet.code} />
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)}>＋ Жаңа тақырып ашу</Button>
        </div>

        {topics.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Әзірге тақырып жоқ"
            description="Жаңа тақырып ашып, оған сөздер қосыңыз."
            action={<Button onClick={() => setModalOpen(true)}>Жаңа тақырып ашу</Button>}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <TopicCard key={topic.id} cabinetId={cabinetId} topic={topic} />
            ))}
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Жаңа тақырып">
        <form onSubmit={handleCreateTopic} className="space-y-4">
          <Input
            label="Тақырып атауы"
            name="title"
            placeholder="Мысалы: Саяхат сөздері"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <Textarea
            label="Сипаттама (міндетті емес)"
            name="description"
            placeholder="Қысқаша сипаттама"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {createError && <Alert tone="error">{createError}</Alert>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Бас тарту
            </Button>
            <Button type="submit" loading={creating}>
              Құру
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function TopicCard({ cabinetId, topic }: { cabinetId: string; topic: Topic }) {
  const count = topic.word_count ?? 0;
  const isReady = topic.status === "ready";

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{topic.title}</h3>
        <span
          className={
            isReady
              ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
              : "rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
          }
        >
          {isReady ? "Дайын" : "Жоба"}
        </span>
      </div>
      {topic.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{topic.description}</p>
      )}
      <p className="mt-3 text-sm text-slate-500">{wordCountLabel(count)}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Link href={`/cabinet/${cabinetId}/topic/${topic.id}/edit`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            Сөз қосу
          </Button>
        </Link>
        <Link
          href={isReady ? `/cabinet/${cabinetId}/topic/${topic.id}/practice` : "#"}
          className="flex-1"
          aria-disabled={!isReady}
          onClick={(e) => {
            if (!isReady) e.preventDefault();
          }}
        >
          <Button size="sm" className="w-full" disabled={!isReady}>
            Дайындық бөлмесі
          </Button>
        </Link>
      </div>
      {!isReady && count < 3 && (
        <p className="mt-2 text-xs text-slate-400">Дайындық үшін кемінде 3 сөз қажет.</p>
      )}
    </Card>
  );
}
