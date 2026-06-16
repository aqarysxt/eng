"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { Topic, Word } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/Spinner";

const MIN_WORDS = 3;

interface WordForm {
  word: string;
  translation: string;
  meaning: string;
  example_sentence: string;
}

const emptyForm: WordForm = { word: "", translation: "", meaning: "", example_sentence: "" };

export default function TopicEditPage() {
  const router = useRouter();
  const params = useParams<{ cabinetId: string; topicId: string }>();
  const { cabinetId, topicId } = params;

  const [user, setUser] = useState<StoredUser | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<WordForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [readyError, setReadyError] = useState("");
  const [markingReady, setMarkingReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ topic }, { words }] = await Promise.all([
        api.getTopic(topicId),
        api.getWords(topicId),
      ]);
      setTopic(topic);
      setWords(words);
    } catch {
      // қате болса бос күй көрсетіледі
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.replace("/");
      return;
    }
    setUser(current);
    load();
  }, [router, load]);

  function updateForm(field: keyof WordForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (form.word.trim().length < 1 || form.translation.trim().length < 1) {
      setFormError("Сөз және аудармасы міндетті.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { word } = await api.updateWord(editingId, form);
        setWords((prev) => prev.map((w) => (w.id === editingId ? word : w)));
      } else {
        const { word } = await api.addWord({ topicId, ...form });
        setWords((prev) => [...prev, word]);
      }
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Қате болды.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(word: Word) {
    setEditingId(word.id);
    setForm({
      word: word.word,
      translation: word.translation,
      meaning: word.meaning || "",
      example_sentence: word.example_sentence || "",
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const previous = words;
    setWords((prev) => prev.filter((w) => w.id !== id));
    if (editingId === id) resetForm();
    try {
      await api.deleteWord(id);
    } catch {
      setWords(previous); // сәтсіз болса қайтарамыз
    }
  }

  async function handleReady() {
    setReadyError("");
    if (words.length < MIN_WORDS) {
      setReadyError(`Дайындық бөлмесі үшін кемінде ${MIN_WORDS} сөз қажет.`);
      return;
    }
    setMarkingReady(true);
    try {
      await api.markTopicReady(topicId);
      router.push(`/cabinet/${cabinetId}/topic/${topicId}/practice`);
    } catch (err) {
      setReadyError(err instanceof Error ? err.message : "Қате болды.");
      setMarkingReady(false);
    }
  }

  if (!user || loading) return <LoadingScreen />;

  const canBeReady = words.length >= MIN_WORDS;

  return (
    <div className="min-h-screen pb-24">
      <TopBar user={user} backHref={`/cabinet/${cabinetId}`} backLabel="Кабинет" />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{topic?.title || "Тақырып"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Сөздерді қосыңыз. Дайындық бөлмесі үшін кемінде {MIN_WORDS} сөз керек.
          </p>
        </div>

        <Card className="mb-8">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {editingId ? "Сөзді өңдеу" : "Сөз қосу"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Сөз"
                name="word"
                placeholder="Сөз"
                value={form.word}
                onChange={(e) => updateForm("word", e.target.value)}
              />
              <Input
                label="Аудармасы"
                name="translation"
                placeholder="Аудармасы"
                value={form.translation}
                onChange={(e) => updateForm("translation", e.target.value)}
              />
            </div>
            <Input
              label="Мағынасы (міндетті емес)"
              name="meaning"
              placeholder="Сөздің мағынасы"
              value={form.meaning}
              onChange={(e) => updateForm("meaning", e.target.value)}
            />
            <Textarea
              label="Мысал сөйлем (міндетті емес)"
              name="example_sentence"
              placeholder="Сөз қолданылған сөйлем"
              value={form.example_sentence}
              onChange={(e) => updateForm("example_sentence", e.target.value)}
            />
            {formError && <Alert tone="error">{formError}</Alert>}
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>
                {editingId ? "Сақтау" : "Сөзді қосу"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Бас тарту
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Қосылған сөздер{" "}
            <span className="text-sm font-normal text-slate-400">({words.length})</span>
          </h2>
        </div>

        {words.length === 0 ? (
          <EmptyState
            icon="✍️"
            title="Әзірге сөз жоқ"
            description="Жоғарыдағы форма арқылы алғашқы сөзіңізді қосыңыз."
          />
        ) : (
          <div className="space-y-2">
            {words.map((word, index) => (
              <Card key={word.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs text-slate-400">{index + 1}.</span>
                      <span className="font-semibold text-slate-900">{word.word}</span>
                      <span className="text-slate-400">—</span>
                      <span className="text-brand-700">{word.translation}</span>
                    </div>
                    {word.meaning && (
                      <p className="mt-1 text-sm text-slate-500">{word.meaning}</p>
                    )}
                    {word.example_sentence && (
                      <p className="mt-1 text-sm italic text-slate-400">“{word.example_sentence}”</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(word)}>
                      Өңдеу
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(word.id)}>
                      🗑
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* "Дайын" төменгі тұрақты панелі */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-slate-500">
            {canBeReady
              ? "Бәрі дайын! Дайындық бөлмесіне өтуге болады."
              : `Тағы ${MIN_WORDS - words.length} сөз қажет.`}
          </p>
          <div className="flex items-center gap-3">
            {readyError && <span className="text-sm text-red-600">{readyError}</span>}
            <Button onClick={handleReady} loading={markingReady} disabled={!canBeReady}>
              Дайын
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
