"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Toast } from "@/components/shared/Toast/Toast";
import { resendOtp, verifyOtp } from "@/services/auth/verifyOtp";

const CODE_LENGTH = 6;
/** Matches the backend's resend cooldown. */
const RESEND_AFTER_SECONDS = 30;

function MailIcon() {
  return (
    <svg
      width="52"
      height="46"
      viewBox="0 0 52 46"
      fill="none"
      aria-hidden="true"
      className="text-[#0b0b0b]"
    >
      {/* The little "code" tab peeking out of the envelope */}
      <rect x="14" y="1" width="24" height="9" rx="2.5" fill="currentColor" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={19 + i * 4} cy="5.5" r="1.1" fill="#ffffff" />
      ))}
      <rect
        x="1.25"
        y="12.25"
        width="49.5"
        height="32.5"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M3 15.5 26 31 49 15.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OtpForm() {
  const searchParams = useSearchParams();
  const maskedEmail = searchParams.get("to") ?? "";
  const redirect = searchParams.get("redirect") ?? "";

  const [state, formAction, isPending] = useActionState(verifyOtp, null);

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_AFTER_SECONDS);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");
  const complete = code.length === CODE_LENGTH && !digits.includes("");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  // Remembers which action result has already been shown, so a re-render
  // never re-toasts the same failure.
  const handledState = useRef<unknown>(null);

  useEffect(() => {
    if (!state || state.success || !state.message) return;
    if (handledState.current === state) return;
    handledState.current = state;

    Toast.fire({ icon: "error", title: state.message });

    // A rejected code is never worth keeping in the boxes. Clearing after the
    // commit rather than inside it avoids a cascading render.
    queueMicrotask(() => {
      setDigits(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
    });
  }, [state]);

  /** Spread a pasted or autofilled string across the boxes. */
  const fill = (value: string, from = 0) => {
    const chars = value.replace(/\D/g, "").slice(0, CODE_LENGTH - from).split("");
    if (chars.length === 0) return;

    setDigits((current) => {
      const next = [...current];
      chars.forEach((char, offset) => {
        next[from + offset] = char;
      });
      return next;
    });

    const landed = Math.min(from + chars.length, CODE_LENGTH - 1);
    inputs.current[landed]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Typing into a filled box, or a keyboard pasting the whole code, both
    // arrive here as multi-character values.
    if (value.length > 1) {
      fill(value, index);
      return;
    }

    const digit = value.replace(/\D/g, "");
    setDigits((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
      setDigits((current) => {
        const next = [...current];
        next[index - 1] = "";
        return next;
      });
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  /** Paste anywhere in the row and the whole code lands in the boxes. */
  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    if (!/\d/.test(pasted)) return;
    event.preventDefault();
    fill(pasted, /\d{6}/.test(pasted.replace(/\D/g, "")) ? 0 : index);
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    const result = await resendOtp();
    Toast.fire({
      icon: result.success ? "success" : "error",
      title: result.message,
    });
    if (result.success) {
      setDigits(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
      setSecondsLeft(RESEND_AFTER_SECONDS);
    }
    setResending(false);
  };

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="rounded-[18px] bg-white/70 p-6 shadow-[0_2px_18px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:p-8">
        <MailIcon />

        <h1 className="mt-5 border-b border-gray-300 pb-3 text-[22px] font-semibold tracking-tight text-gray-900">
          Enter Your OTP
        </h1>
        <p className="mt-3 text-[13px] leading-snug text-gray-500">
          Enter the {CODE_LENGTH} digit code that you received on your email
          {maskedEmail ? (
            <>
              {" "}
              <span className="font-medium text-gray-700">{maskedEmail}</span>
            </>
          ) : null}
          .
        </p>

        <form action={formAction} className="mt-6">
          <input type="hidden" name="otp" value={code} />
          {redirect && <input type="hidden" name="redirect" value={redirect} />}

          <div className="flex items-center justify-between gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                onFocus={(event) => event.target.select()}
                type="text"
                inputMode="numeric"
                // Lets browsers and iOS/Android offer the code straight from
                // the SMS/email notification.
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={CODE_LENGTH}
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                className="h-12 w-full min-w-0 rounded-lg border border-transparent bg-gray-100 text-center text-[18px] font-semibold text-gray-900 transition focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!complete || isPending}
            className="mt-6 h-12 w-full rounded-lg bg-black text-[14px] font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isPending ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-[13px] text-gray-500">Not receive a code?</p>
          {secondsLeft > 0 ? (
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-gray-400">
              Resend OTP in {secondsLeft}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-1 text-[12px] font-semibold uppercase tracking-wide text-gray-900 underline underline-offset-2 transition hover:text-black disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-[12px] text-gray-500">
        Wrong account?{" "}
        <Link href="/login" className="font-medium text-gray-900 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
