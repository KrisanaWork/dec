import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ — Digital Exam Centre",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-ink-900">
        <div className="absolute -top-40 -left-32 h-128 w-lg rounded-full bg-brand-600/70 blur-[110px]" />
        <div className="absolute top-1/3 -right-24 h-112 w-md rounded-full bg-brand-800/70 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-104 w-104 rounded-full bg-brand-500/40 blur-[130px] motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="absolute top-6 left-6 z-10 sm:top-8 sm:left-10">
        <div className="inline-flex items-center rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <Image
            src="/logo.svg"
            alt="Digital Exam Centre"
            width={132}
            height={109}
            className="h-6 w-auto"
          />
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
