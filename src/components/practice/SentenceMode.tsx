"use client";

import { useMemo, useState } from "react";
import { shuffle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

export function SentenceMode({ words, onFinish, onExit }: ModeProps) {
  const deck = useMemo(() => shuffle(words), [words]);
  const [index, setIndex] = useState(0);
  const [sentence, setSentence] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = deck[index];

  function validate(e: React.FormEvent) {
    e.preventDefault();
    if (result) return;

    const trimmed = sentence.trim();
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const includesWord = trimmed.toLowerCase().includes(current.word.trim().toLowerCase());

    if (trimmed.length === 0) {
      setResult({ ok: false, message: "Сөйлем бос болмауы керек." });
      return;
    }
    if (!includesWord) {
      setResult({ ok: false, message: `Сөйлемде «${current.word}» сөзі болуы керек.` });
      return;
    }
    if (tokens.length < 3) {
      setResult({ ok: false, message: "Сөйлемде кемінде 3 сөз болуы керек." });
      return;
    }

    setCorrect((c) => c + 1);
    setResult({ ok: true, message: "Жарайсыз! Сөйлем дұрыс құрылды." });
  }

  function retry() {
    setResult(null);
  }

  function next() {
    // Қате жауаптарды соңында есепке аламыз: тексеру сәтсіз болып, келесіге өтсе
    const movingOn = result?.ok ? correct : correct;
    const finalWrong = result?.ok ? wrong : wrong + 1;
    if (!result?.ok) setWrong(finalWrong);

    if (index + 1 >= deck.length) {
      setDone(true);
      onFinish(movingOn, finalWrong);
      return;
    }
    setIndex((i) => i + 1);
    setSentence("");
    setResult(null);
  }

  function restart() {
    setIndex(0);
    setSentence("");
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
        <p className="text-xs uppercase tracking-wide text-brand-400">Осы сөзбен сөйлем құрастырыңыз</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{current.word}</p>
      </div>

      <form onSubmit={validate} className="space-y-4">
        <Textarea
          name="sentence"
          placeholder={`«${current.word}» сөзін қолданып сөйлем жазыңыз`}
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          disabled={result?.ok}
          autoFocus
        />

        {result && (
          <div
            className={
              result.ok
                ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                : "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            }
          >
            {result.message}
          </div>
        )}

        {result?.ok && current.example_sentence && (
          <p className="text-sm text-slate-500">
            Мысал: <span className="italic">“{current.example_sentence}”</span>
          </p>
        )}

        {!result && (
          <Button type="submit" className="w-full">
            Тексеру
          </Button>
        )}
        {result && !result.ok && (
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={retry}>
              Қайта көру
            </Button>
            <Button type="button" className="flex-1" onClick={next}>
              Өткізіп жіберу
            </Button>
          </div>
        )}
        {result?.ok && (
          <Button type="button" className="w-full" onClick={next}>
            {index + 1 >= deck.length ? "Аяқтау" : "Келесі"}
          </Button>
        )}
      </form>
    </div>
  );
}
