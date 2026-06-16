"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/lib/types";
import { cn, shuffle } from "@/lib/utils";
import { ModeComplete, ModeProps, ProgressBar } from "./shared";

interface Item {
  id: string;
  text: string;
}

export function MatchingMode({ words, onFinish, onExit }: ModeProps) {
  // Сәйкестендіруді басқарылатын ету үшін ең көбі 8 жұп
  const pairs = useMemo(() => shuffle(words).slice(0, Math.min(words.length, 8)), [words]);

  const [leftItems, setLeftItems] = useState<Item[]>(() =>
    shuffle(pairs.map((w) => ({ id: w.id, text: w.word }))),
  );
  const [rightItems, setRightItems] = useState<Item[]>(() =>
    shuffle(pairs.map((w) => ({ id: w.id, text: w.translation }))),
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  function tryMatch(left: string, right: string) {
    if (left === right) {
      const nextMatched = new Set(matched).add(left);
      const nextCorrect = correct + 1;
      setMatched(nextMatched);
      setCorrect(nextCorrect);
      setSelectedLeft(null);
      setSelectedRight(null);
      if (nextMatched.size === pairs.length) {
        setDone(true);
        onFinish(nextCorrect, wrong);
      }
    } else {
      setWrong((w) => w + 1);
      setWrongPair({ left, right });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 600);
    }
  }

  function pickLeft(id: string) {
    if (matched.has(id) || wrongPair) return;
    setSelectedLeft(id);
    if (selectedRight) tryMatch(id, selectedRight);
  }

  function pickRight(id: string) {
    if (matched.has(id) || wrongPair) return;
    setSelectedRight(id);
    if (selectedLeft) tryMatch(selectedLeft, id);
  }

  function restart() {
    setLeftItems(shuffle(pairs.map((w) => ({ id: w.id, text: w.word }))));
    setRightItems(shuffle(pairs.map((w) => ({ id: w.id, text: w.translation }))));
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatched(new Set());
    setWrongPair(null);
    setCorrect(0);
    setWrong(0);
    setDone(false);
  }

  if (done) {
    return <ModeComplete correct={correct} wrong={wrong} onRestart={restart} onExit={onExit} />;
  }

  function cellClass(id: string, selected: boolean, side: "left" | "right") {
    const isMatched = matched.has(id);
    const isWrong =
      wrongPair && ((side === "left" && wrongPair.left === id) || (side === "right" && wrongPair.right === id));
    return cn(
      "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
      isMatched && "cursor-default border-emerald-200 bg-emerald-50 text-emerald-600 opacity-60",
      !isMatched && isWrong && "border-red-300 bg-red-50 text-red-700",
      !isMatched && !isWrong && selected && "border-brand-500 bg-brand-50 text-brand-700",
      !isMatched && !isWrong && !selected && "border-slate-200 bg-white text-slate-700 hover:border-brand-200",
    );
  }

  return (
    <div>
      <ProgressBar current={matched.size} total={pairs.length} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          {leftItems.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matched.has(item.id)}
              onClick={() => pickLeft(item.id)}
              className={cellClass(item.id, selectedLeft === item.id, "left")}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {rightItems.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matched.has(item.id)}
              onClick={() => pickRight(item.id)}
              className={cellClass(item.id, selectedRight === item.id, "right")}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
