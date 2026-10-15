import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { SparkleIcon } from "@/components/icons";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meme'd Payout Tracker",
  description: "Brands run campaigns, creators earn by view milestones.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main className="mx-auto w-full max-w-[1360px] px-4 pt-8 pb-28 sm:px-8">{children}</main>
        </AuthProvider>

        {/* Decorative sparkles, bottom right */}
        <div className="pointer-events-none fixed right-6 bottom-6 hidden text-neutral-900 md:block" aria-hidden>
          <SparkleIcon className="size-14" />
          <SparkleIcon className="-mt-1 ml-9 size-7" />
        </div>
      </body>
    </html>
  );
}
