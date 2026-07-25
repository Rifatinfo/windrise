"use client";

import { Toast } from "@/components/shared/Toast/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
export const dynamic = "force-dynamic";

const LoginSuccessToast = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("loggedIn") === "true") {
      //  Only here after async login
      Toast.fire({
        icon: "success",
        title: "logged in successfully!",
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("loggedIn");
      router.replace(newUrl.toString());
    }
  }, [searchParams, router]);

  return null;
};

export default LoginSuccessToast;