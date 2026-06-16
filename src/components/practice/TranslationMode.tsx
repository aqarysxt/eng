"use client";

import { useMemo, useState } from "react";
import { cn, normalizeAnswer, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

export function TranslationMode({ words, onFinish, onExit }: ModeProps) {
  const deck = useMemo(() => shuffle(words), [words]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;
    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(current.translation);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setResult("correct");
    } else {
      setWrong((w) => w + 1);
      setResult("wrong");
    }
  }

  function next() {
    if (index + 1 >= deck.length) {
      setDone(true);
      onFinish(correct, wrong);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setResult(null);
  }

  function restart() {
    setIndex(0);
    setAnswer("");
    setResult(null);
    setCorrect(0);
    setWrong(0);
    setDone(false);
  }

  if (done) {
    return <ModeComplete correct={correct} wrong={wrong} onRestart={restart} onExit={onExit} />;
  }

  return (
    <div>
      <ProgressBar current={index} total={deck.length} />

      <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-brand-400">Аудармасын жазыңыз</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{current.word}</p>
      </div>

      <form onSubmit={check} className="space-y-4">
        <Input
          name="answer"
          placeholder="Аудармасын енгізіңіз"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={!!result}
          autoFocus
          autoComplete="off"
        />

        {result && (
          <div
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-medium",
              result === "correct"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {result === "correct" ? "Дұрыс!" : `Қате. Дұрыс жауабы: ${current.translation}`}
          </div>
        )}

        {!result ? (
          <Button type="submit" className="w-full">
            Тексеру
          </Button>
        ) : (
          <Button type="button" className="w-full" onClick={next}>
            {index + 1 >= deck.length ? "Аяқтау" : "Келесі"}
          </Button>
        )}
      </form>
    </div>
  );
}
