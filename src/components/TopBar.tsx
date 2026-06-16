"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearCurrentUser, type StoredUser } from "@/lib/currentUser";

interface TopBarProps {
  user: StoredUser | null;
  backHref?: string;
  backLabel?: string;
}

export function TopBar({ user, backHref, backLabel }: TopBarProps) {
  const router = useRouter();

  function logout() {
    clearCurrentUser();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              ← {backLabel || "Артқа"}
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
                W
              </span>
              <span className="text-lg font-bold text-slate-900">WordRoom</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-500 sm:inline">{user.full_name}</span>
          )}
          <button
            onClick={logout}
            className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            Шығу
          </button>
        </div>
      </div>
    </header>
  );
}
