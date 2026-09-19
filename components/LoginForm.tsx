"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      router.push(nextPath || "/dashboard");
      router.refresh();
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-105 animate-[card-rise_0.55s_ease-out]">
      <div className="rounded-3xl border border-white/15 bg-white/95 p-8 shadow-[0_30px_80px_-25px_rgba(6,42,82,0.45)] backdrop-blur-xl sm:p-10">
        <header className="mb-7">
          <Image
            src="/logo.svg"
            alt="Digital Exam Centre"
            width={132}
            height={109}
            className="mb-4 h-9 w-auto"
          />
          <h1 className="font-heading text-[1.7rem] font-semibold leading-snug text-ink-900">
            เข้าสู่ระบบ
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
            กรอกรหัสประจำตัวและรหัสผ่านที่ทางโรงเรียนออกให้
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2.5 text-sm text-brand-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="relative">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder=" "
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="peer w-full rounded-xl border border-ink-100 bg-ink-50/60 px-4 pb-2 pt-5 text-sm text-ink-900 outline-none transition-colors placeholder-shown:pt-3.5 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
            />
            <label
              htmlFor="username"
              className="pointer-events-none absolute left-4 top-3.5 text-sm text-ink-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[0.72rem] peer-focus:text-brand-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[0.72rem]"
            >
              รหัสนักเรียน / รหัสครู
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder=" "
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full rounded-xl border border-ink-100 bg-ink-50/60 px-4 pb-2 pt-5 pr-16 text-sm text-ink-900 outline-none transition-colors placeholder-shown:pt-3.5 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15"
            />
            <label
              htmlFor="password"
              className="pointer-events-none absolute left-4 top-3.5 text-sm text-ink-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[0.72rem] peer-focus:text-brand-600 peer-not-placeholder-shown:top-1.5 peer-not-placeholder-shown:text-[0.72rem]"
            >
              รหัสผ่าน
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-ink-400 transition-colors hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? "ซ่อน" : "แสดง"}
            </button>
          </div>

          <div className="flex items-center justify-between pt-0.5 text-[0.83rem]">
            <label className="flex items-center gap-2 text-ink-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-ink-100 accent-brand-500"
              />
              จดจำฉันไว้ในเครื่องนี้
            </label>
            <a
              href="#"
              className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-linear-to-b from-brand-500 to-brand-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-8px_rgba(4,126,239,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-8px_rgba(4,126,239,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-7 text-center text-[0.83rem] leading-relaxed text-ink-400">
          เข้าสอบไม่ได้หรือลืมรหัสผ่าน?
          <br />
          ติดต่อ
          <a href="#" className="font-medium text-brand-600 hover:underline">
            ครูประจำวิชา
          </a>{" "}
          หรือ
          <a href="#" className="font-medium text-brand-600 hover:underline">
            ฝ่ายทะเบียน
          </a>
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-white/60">
        โรงเรียนสาธิตดิจิทัล · ปีการศึกษา 2569
      </p>
    </div>
  );
}
