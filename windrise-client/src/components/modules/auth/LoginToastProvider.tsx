"use client";

import dynamic from "next/dynamic";

const LoginSuccessToast = dynamic(
  () => import("@/components/modules/auth/LoginSuccessToast"),
  { ssr: false }
);

export function LoginToastProvider() {
  return <LoginSuccessToast />;
}
