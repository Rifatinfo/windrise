"use client";

import { Toast } from "@/components/shared/Toast/Toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const LogoutSuccessToast = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("loggedOut") === "true") {
      Toast.fire({
              icon: "success",
              title: "logged out successfully!",
            });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("loggedOut");
      router.replace(newUrl.toString());
    }
  }, [searchParams, router]);
  return null;
};

export default LogoutSuccessToast;