"use client";

import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DeviceApprovalPage() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isPending && !data?.session && !data?.user) {
      router.push(`/sign-in?redirect=/approve?user_code=${userCode}`);
    }
  }, [isPending, data, router, userCode]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await authClient.device.approve({
        userCode: userCode!,
      });
      alert("Device approved successfully!");
      window.location.href = "/";
    } catch (error) {
      alert("Failed to approve device");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    setIsProcessing(true);
    try {
      await authClient.device.deny({
        userCode: userCode!,
      });
      alert("Device denied");
      window.location.href = "/";
    } catch (error) {
      alert("Failed to deny device");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2>Device Authorization Request</h2>
      <p>A device is requesting access to your account.</p>
      <p>Code: {userCode}</p>

      <button onClick={handleApprove} disabled={isProcessing}>
        Approve
      </button>
      <button onClick={handleDeny} disabled={isProcessing}>
        Deny
      </button>
    </div>
  );
}
