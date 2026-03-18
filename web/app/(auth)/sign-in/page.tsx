"use client";
import { LoginForm } from "@/components/login-form";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, Suspense } from "react";

const SignInContent = () => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (!isPending && data?.session && data?.user) {
      router.push(redirect || "/");
    }
  }, [isPending, data, router, redirect]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <LoginForm />
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <Spinner className="text-white w-8 h-8" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
};

export default Page;
