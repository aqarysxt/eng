"use client";

import type { Cabinet, PracticeResult, Topic, User, Word } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = (data && (data.error as string)) || "Белгісіз қате болды.";
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  // Users
  createUser: (fullName: string) =>
    request<{ user: User }>("/api/users", {
      method: "POST",
      body: JSON.stringify({ fullName }),
    }),

  // Cabinets
  getCabinets: (userId: string) =>
    request<{ cabinets: Cabinet[] }>(`/api/cabinets?userId=${encodeURIComponent(userId)}`),

  getCabinet: (cabinetId: string) =>
    request<{ cabinet: Cabinet }>(`/api/cabinets/${cabinetId}`),

  createCabinet: (name: string, userId: string) =>
    request<{ cabinet: Cabinet }>("/api/cabinets", {
      method: "POST",
      body: JSON.stringify({ name, userId }),
    }),

  joinCabinet: (code: string, userId: string) =>
    request<{ cabinet: Cabinet }>("/api/cabinets/join", {
      method: "POST",
      body: JSON.stringify({ code, userId }),
    }),

  // Topics
  getTopics: (cabinetId: string) =>
    request<{ topics: Topic[] }>(`/api/topics?cabinetId=${encodeURIComponent(cabinetId)}`),

  getTopic: (topicId: string) =>
    request<{ topic: Topic }>(`/api/topics/${topicId}`),

  createTopic: (cabinetId: string, title: string, description: string) =>
    request<{ topic: Topic }>("/api/topics", {
      method: "POST",
      body: JSON.stringify({ cabinetId, title, description }),
    }),

  markTopicReady: (topicId: string) =>
    request<{ topic: Topic }>(`/api/topics/${topicId}/ready`, { method: "POST" }),

  // Words
  getWords: (topicId: string) =>
    request<{ words: Word[] }>(`/api/words?topicId=${encodeURIComponent(topicId)}`),

  addWord: (input: {
    topicId: string;
    word: string;
    translation: string;
    meaning: string;
    example_sentence: string;
  }) =>
    request<{ word: Word }>("/api/words", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateWord: (
    wordId: string,
    input: { word: string; translation: string; meaning: string; example_sentence: string },
  ) =>
    request<{ word: Word }>(`/api/words/${wordId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  deleteWord: (wordId: string) =>
    request<{ success: true }>(`/api/words/${wordId}`, { method: "DELETE" }),

  // Practice
  savePracticeResult: (input: {
    userId: string;
    topicId: string;
    mode: string;
    correctCount: number;
    wrongCount: number;
  }) =>
    request<{ result: PracticeResult }>("/api/practice-results", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
