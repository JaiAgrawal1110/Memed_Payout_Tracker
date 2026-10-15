"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/tailgrids/core/spinner";
import { homePathFor, useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? homePathFor(user.role) : "/login");
  }, [loading, user, router]);

  return (
    <div className="flex justify-center py-24 text-neutral-500">
      <Spinner size="lg" />
    </div>
  );
}
