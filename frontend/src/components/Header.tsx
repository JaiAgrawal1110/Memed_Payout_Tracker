"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { homePathFor, useAuth } from "@/lib/auth";
import { initials } from "@/lib/format";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-[#e6dfcf] bg-[#fcf9f2]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-8">
        <Link href={user ? homePathFor(user.role) : "/login"} className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">M</span>
          <span className="text-[15px] font-semibold tracking-tight text-neutral-900">Meme&apos;d Payouts</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar size="sm">
                <AvatarFallback className="bg-[#e5e3f6]! text-[#4b47a8]!">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start gap-0.5 leading-none">
                <span className="text-[13px] font-medium text-neutral-900">{user.name}</span>
                <Badge color="gray" size="sm" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              appearance="outline"
              onPress={() => {
                logout();
                router.replace("/login");
              }}
            >
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
