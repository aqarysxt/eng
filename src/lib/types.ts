export type TopicStatus = "draft" | "ready";

export type PracticeMode =
  | "flip"
  | "matching"
  | "meaning"
  | "translation"
  | "listening"
  | "sentence";

export interface User {
  id: string;
  full_name: string;
  created_at: string;
}

export interface Cabinet {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  created_at: string;
}

export interface Topic {
  id: string;
  cabinet_id: string;
  title: string;
  description: string | null;
  status: TopicStatus;
  created_at: string;
  /** Computed in API responses. */
  word_count?: number;
}

export interface Word {
  id: string;
  topic_id: string;
  word: string;
  translation: string;
  meaning: string | null;
  example_sentence: string | null;
  created_at: string;
}

export interface PracticeResult {
  id: string;
  user_id: string;
  topic_id: string;
  mode: string;
  correct_count: number;
  wrong_count: number;
  completed_at: string;
}
