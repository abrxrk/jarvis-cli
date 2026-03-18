"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { GithubIcon } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [isPending, setIsPending] = useState(false);

  const handleGithubSignIn = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `http://localhost:3000${redirect}`,
      });
    } catch {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      <Card className="border-zinc-800 bg-black/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Login to authorize your CLI
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant={"outline"}
                className="w-full bg-white text-white hover:bg-zinc-200 hover:text-white border-0 transition-colors h-12 text-lg font-medium"
                type="button"
                onClick={handleGithubSignIn}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Spinner className="size-5 mr-2" />
                    Continuing...
                  </>
                ) : (
                  <>
                    <GithubIcon className="size-5 mr-2" />
                    Continue with GitHub
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
