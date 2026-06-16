/** Tailwind-friendly className joiner. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ұқсас таңбалар (O/0, I/1) алынбаған

/** 6 таңбалы кабинет коды, мысалы: A7KQ92. */
export function generateCabinetCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** Жауаптарды салыстыруға арналған нормализация. */
export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Массивтің көшірмесін араластырады (Fisher–Yates). */
export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Сөздер санын дұрыс сөзбен қайтарады. */
export function wordCountLabel(count: number): string {
  return `${count} сөз`;
}
