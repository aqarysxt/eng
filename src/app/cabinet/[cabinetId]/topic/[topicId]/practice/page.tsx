"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCurrentUser, type StoredUser } from "@/lib/currentUser";
import type { PracticeMode, Topic, Word } from "@/lib/types";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { LoadingScreen } from "@/components/ui/Spinner";
import { FlipCardMode } from "@/components/practice/FlipCardMode";
import { MatchingMode } from "@/components/practice/MatchingMode";
import { MeaningMode } from "@/components/practice/MeaningMode";
import { TranslationMode } from "@/components/practice/TranslationMode";
import { ListeningMode } from "@/components/practice/ListeningMode";
import { SentenceMode } from "@/components/practice/SentenceMode";

interface ModeMeta {
  key: PracticeMode;
  title: string;
  description: string;
  icon: string;
}

const MODES: ModeMeta[] = [
  { key: "flip", title: "Flip Card", description: "Картаны аударып, есте сақта.", icon: "🃏" },
  { key: "matching", title: "Сәйкестендіру", description: "Сөз бен аударманы қос.", icon: "🔗" },
  { key: "meaning", title: "Мағынасын тап", description: "Дұрыс аударманы таңда.", icon: "🎯" },
  { key: "translation", title: "Аудармасын жаз", description: "Аударманы өзің жаз.", icon: "⌨️" },
  { key: "listening", title: "Тыңдап жаз", description: "Естіген сөзіңді жаз.", icon: "🔊" },
  { key: "sentence", title: "Сөйлем құрастыр", description: "Сөзбен сөйлем құр.", icon: "✏️" },
];

const MODE_LABEL: Record<PracticeMode, string> = MODES.reduce(
  (acc, m) => ({ ...acc, [m.key]: m.title }),
  {} as Record<PracticeMode, string>,
);

export default function PracticePage() {
  const router = useRouter();
  const params = useParams<{ cabinetId: string; topicId: string }>();
  const { cabinetId, topicId } = params;

  const [user, setUser] = useState<StoredUser | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeMode, setActiveMode] = useState<PracticeMode | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);

  const load = useCallback(async () => {
    try {
      const [{ topic }, { words }] = await Promise.all([
        api.getTopic(topicId),
        api.getWords(topicId),
      ]);
      setTopic(topic);
      setWords(words);
    } catch {
      // қате жағдайда төмендегі тексеру арқылы хабар көрсетіледі
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

  const handleFinish = useCallback(
    (mode: PracticeMode) => (correct: number, wrong: number) => {
      setTotalCorrect((c) => c + correct);
      setTotalWrong((w) => w + wrong);
      if (user) {
        api
          .savePracticeResult({
            userId: user.id,
            topicId,
            mode,
            correctCount: correct,
            wrongCount: wrong,
          })
          .catch(() => {
            /* нәтиже сақталмаса да жаттығу жалғаса береді */
          });
      }
    },
    [user, topicId],
  );

  if (!user || loading) return <LoadingScreen />;

  // 3 сөзден аз болса дайындық бөлмесі ашылмауы керек
  if (!topic || words.length < 3) {
    return (
      <div className="min-h-screen">
        <TopBar user={user} backHref={`/cabinet/${cabinetId}`} backLabel="Кабинет" />
        <main className="mx-auto max-w-2xl px-4 py-12">
          <Alert tone="error">
            Бұл тақырыпта дайындық бөлмесін ашуға жеткілікті сөз жоқ (кемінде 3 сөз қажет).
          </Alert>
          <div className="mt-4">
            <Link href={`/cabinet/${cabinetId}/topic/${topicId}/edit`}>
              <Button>Сөз қосуға өту</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const exitToModes = () => setActiveMode(null);

  function renderMode() {
    const props = {
      words,
      onFinish: handleFinish(activeMode as PracticeMode),
      onExit: exitToModes,
    };
    switch (activeMode) {
      case "flip":
        return <FlipCardMode {...props} />;
      case "matching":
        return <MatchingMode {...props} />;
      case "meaning":
        return <MeaningMode {...props} />;
      case "translation":
        return <TranslationMode {...props} />;
      case "listening":
        return <ListeningMode {...props} />;
      case "sentence":
        return <SentenceMode {...props} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar user={user} backHref={`/cabinet/${cabinetId}`} backLabel="Кабинет" />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{topic.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Дайындық бөлмесі — режимді таңдап жаттығыңыз.</p>
        </div>

        {/* Прогресс жиынтығы */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-bold text-slate-900">{words.length}</p>
            <p className="text-xs text-slate-500">Барлық сөз</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{totalCorrect}</p>
            <p className="text-xs text-slate-500">Дұрыс</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-500">{totalWrong}</p>
            <p className="text-xs text-slate-500">Қате</p>
          </Card>
        </div>

        {activeMode ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{MODE_LABEL[activeMode]}</h2>
              <Button variant="ghost" size="sm" onClick={exitToModes}>
                ← Режимдер
              </Button>
            </div>
            <Card className="p-5 sm:p-6">{renderMode()}</Card>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {MODES.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setActiveMode(mode.key)}
                className="text-left"
              >
                <Card className="h-full transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">
                      {mode.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{mode.title}</h3>
                      <p className="text-sm text-slate-500">{mode.description}</p>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
