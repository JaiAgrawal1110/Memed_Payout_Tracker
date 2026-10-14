"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { homePathFor, useAuth } from "@/lib/auth";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="header">
      <Link href={user ? homePathFor(user.role) : "/login"} className="brand-mark">
        Meme&apos;d Payouts
      </Link>
      {user && (
        <div className="header-right">
          <span className="muted small">
            {user.name} · <span className="chip">{user.role}</span>
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
