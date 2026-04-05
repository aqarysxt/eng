import { useEffect, useMemo } from 'react';

/**
 * Hook to access the Telegram Web App SDK.
 * Provides tg instance, user data, initData, and theme info.
 */
export function useTelegram() {
  const tg = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Apply Telegram theme class
      document.body.classList.add('tg-theme');
    }
  }, [tg]);

  const user = tg?.initDataUnsafe?.user || null;
  const initData = tg?.initData || '';
  const colorScheme = tg?.colorScheme || 'dark';
  const themeParams = tg?.themeParams || {};

  const close = () => tg?.close();
  const showAlert = (msg) => tg?.showAlert(msg);

  return {
    tg,
    user,
    initData,
    colorScheme,
    themeParams,
    close,
    showAlert,
  };
}
