import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Telegram initData to every request
api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});

// Response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────
export const authenticate = () => api.post('/api/auth');

// ── Lessons ──────────────────────────────────────────
export const getTodayLesson = () => api.get('/api/lessons/today');
export const getLesson = (day) => api.get(`/api/lessons/${day}`);

// ── Speaking ─────────────────────────────────────────
export const submitSpeaking = (audioBlob, day) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('day', day.toString());
  return api.post('/api/speaking', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // Whisper can take time
  });
};

// ── Writing ──────────────────────────────────────────
export const submitWriting = (text, day) =>
  api.post('/api/writing', { text, day });

// ── Progress ─────────────────────────────────────────
export const getProgress = () => api.get('/api/progress');
export const updateProgress = (day, skill) =>
  api.put(`/api/progress/${day}`, { skill });

export default api;
