"use client";

import type { Word } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export interface ModeProps {
  words: Word[];
  onFinish: (correct: number, wrong: number) => void;
  onExit: () => void;
}

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
        <span>
          {current} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ModeComplete({
  correct,
  wrong,
  onRestart,
  onExit,
}: {
  correct: number;
  wrong: number;
  onRestart: () => void;
  onExit: () => void;
}) {
  const total = correct + wrong;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-card">
      <div className="mb-3 text-4xl">{pct >= 70 ? "🎉" : "💪"}</div>
      <h3 className="text-xl font-bold text-slate-900">Режим аяқталды!</h3>
      <p className="mt-1 text-sm text-slate-500">
        Дұрыс: <span className="font-semibold text-emerald-600">{correct}</span> · Қате:{" "}
        <span className="font-semibold text-red-500">{wrong}</span>
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={onRestart}>
          Қайталау
        </Button>
        <Button onClick={onExit}>Режимдерге оралу</Button>
      </div>
    </div>
  );
}

/** Берілген сөзден басқа сөздердің аудармаларынан жалған нұсқалар жинайды. */
export function buildOptions(words: Word[], correctWord: Word, count = 4): string[] {
  const wrongPool = words
    .filter((w) => w.id !== correctWord.id)
    .map((w) => w.translation)
    .filter((t) => t && t !== correctWord.translation);

  const unique = Array.from(new Set(wrongPool));
  // араластыру
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  const options = [correctWord.translation, ...unique.slice(0, count - 1)];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}
