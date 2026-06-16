"use client";

import { useEffect, useMemo, useState } from "react";
import { cn, normalizeAnswer, shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

export function ListeningMode({ words, onFinish, onExit }: ModeProps) {
  const deck = useMemo(() => shuffle(words), [words]);
  const [supported, setSupported] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  function speak() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(current.word);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  // Әр жаңа сөзде автоматты түрде дыбыстау
  useEffect(() => {
    if (supported && !done) speak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, supported]);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;
    const isCorrect = normalizeAnswer(answer) === normalizeAnswer(current.word);
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

  if (!supported) {
    return (
      <div className="space-y-4">
        <Alert tone="error">Бұл браузер тыңдалым режимін қолдамайды.</Alert>
        <Button variant="secondary" onClick={onExit}>
          Режимдерге оралу
        </Button>
      </div>
    );
  }

  if (done) {
    return <ModeComplete correct={correct} wrong={wrong} onRestart={restart} onExit={onExit} />;
  }

  return (
    <div>
      <ProgressBar current={index} total={deck.length} />

      <div className="mb-6 flex flex-col items-center rounded-2xl border border-brand-100 bg-brand-50 p-8 text-center">
        <p className="text-xs uppercase tracking-wide text-brand-400">Естіген сөзіңізді жазыңыз</p>
        <button
          type="button"
          onClick={speak}
          className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl text-white shadow-soft transition hover:bg-brand-700"
          aria-label="Қайта тыңдау"
        >
          🔊
        </button>
        <span className="mt-3 text-xs text-slate-400">Қайта тыңдау үшін басыңыз</span>
      </div>

      <form onSubmit={check} className="space-y-4">
        <Input
          name="answer"
          placeholder="Естіген сөзіңіз"
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
            {result === "correct" ? "Дұрыс!" : `Қате. Дұрыс жауабы: ${current.word}`}
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
