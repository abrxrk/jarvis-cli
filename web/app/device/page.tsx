"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  TerminalSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  GithubIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function DeviceAuthorizationContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("user_code") || "";
  const [userCode, setUserCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [isRedirectingToLogin, setIsRedirectingToLogin] = useState(false);
  const [step, setStep] = useState<"input" | "login" | "approve">("input");
  const hasAttemptedAutoVerify = useRef(false);

  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  const verifyCode = async (code: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const formattedCode = code.trim().replace(/-/g, "").toUpperCase();

      if (!formattedCode) {
        setError("Please enter a device code");
        return;
      }

      // Check if the code is valid using GET /device endpoint
      const response = await authClient.device({
        query: { user_code: formattedCode },
      });

      if (response.data) {
        // Code is valid. Now check if logged in.
        if (!data?.session) {
          setUserCode(formattedCode);
          setStep("login");
          return;
        }

        // Valid and logged in, move to approve step
        setUserCode(formattedCode);
        setStep("approve");
      }
    } catch (err) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // Only attempt auto-verify once when dependencies are resolved
    if (initialCode && !isPending && !hasAttemptedAutoVerify.current) {
      hasAttemptedAutoVerify.current = true;
      verifyCode(initialCode);
    }
  }, [initialCode, isPending, data]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    verifyCode(userCode);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    try {
      await authClient.device.approve({
        userCode: userCode,
      });
      router.push("/");
    } catch (error) {
      setError("Failed to approve device");
      setIsApproving(false);
    }
  };

  const handleDeny = async () => {
    setIsDenying(true);
    setError(null);
    try {
      await authClient.device.deny({
        userCode: userCode,
      });
      router.push("/");
    } catch (error) {
      setError("Failed to deny device");
      setIsDenying(false);
    }
  };

  const handleSocialSignIn = async () => {
    if (isRedirectingToLogin) {
      return;
    }

    setIsRedirectingToLogin(true);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `http://localhost:3000/device?user_code=${userCode}`,
      });
    } catch {
      setIsRedirectingToLogin(false);
      setError("Failed to continue with GitHub");
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-black/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto bg-blue-500/10 p-3 rounded-full w-fit mb-4">
              <ShieldAlert className="w-8 h-8 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Login Required
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-2">
              You need to be logged in to authorize this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800 mb-4">
              <p className="text-center text-sm text-zinc-400 mb-2">
                Device Code
              </p>
              <p className="text-center text-4xl font-mono tracking-[0.2em] font-bold text-white">
                {userCode?.match(/.{1,4}/g)?.join("-") || userCode}
              </p>
            </div>
            <Button
              variant={"outline"}
              className="w-full bg-white text-white hover:bg-zinc-200 hover:text-white border-0 transition-colors h-12 text-lg font-medium"
              type="button"
              onClick={handleSocialSignIn}
              disabled={isRedirectingToLogin}
            >
              {isRedirectingToLogin ? (
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "approve") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md border-zinc-800 bg-black/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto bg-blue-500/10 p-3 rounded-full w-fit mb-4">
              <ShieldAlert className="w-8 h-8 text-blue-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Authorize Device
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-2">
              A device is requesting access to your account. Please verify the
              code below matches what is shown on your CLI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
              <p className="text-center text-sm text-zinc-400 mb-2">
                Device Code
              </p>
              <p className="text-center text-4xl font-mono tracking-[0.2em] font-bold text-white">
                {userCode?.match(/.{1,4}/g)?.join("-") || userCode}
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-2 justify-center">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6 w-full">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12"
              onClick={handleDeny}
              disabled={isApproving || isDenying}
            >
              {isDenying ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Denying...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny Access
                </>
              )}
            </Button>
            <Button
              className="w-full flex items-center justify-center bg-white text-black hover:bg-zinc-200 h-12"
              onClick={handleApprove}
              disabled={isApproving || isDenying}
            >
              {isApproving ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Device
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-black/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto bg-blue-500/10 p-3 rounded-full w-fit mb-4">
            <TerminalSquare className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Connect Device
          </CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            Enter the authorization code displayed on your CLI or device to
            connect it to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Input
                type="text"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                maxLength={9}
                className="text-center text-2xl tracking-[0.2em] font-mono h-14 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
              />
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2 justify-center">
                  <AlertCircle className="w-4 h-4" />
                  <p>{error}</p>
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium bg-white text-black hover:bg-zinc-200"
              disabled={isVerifying || !userCode.trim()}
            >
              {isVerifying ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DeviceAuthorizationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
          <Spinner className="text-white w-8 h-8" />
        </div>
      }
    >
      <DeviceAuthorizationContent />
    </Suspense>
  );
}
