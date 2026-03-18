"use client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut, Terminal, User as UserIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useEffect } from "react";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !data?.session && !data?.user) {
      router.push("/sign-in");
    }
  }, [isPending, data, router]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  if (!data?.session && !data?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <Spinner className="text-white w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 font-sans">
      <Card className="w-full max-w-md border-zinc-800 bg-black/50 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto bg-green-500/10 p-3 rounded-full w-fit mb-4">
            <Terminal className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Dashboard
          </CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            Manage your Jarvis CLI connection and account details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
            {data?.user?.image ? (
              <img
                src={data.user.image}
                alt={data.user.name || "User profile"}
                className="w-20 h-20 rounded-full border-2 border-zinc-800 mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                <UserIcon className="w-10 h-10 text-zinc-500" />
              </div>
            )}

            <h2 className="text-xl font-semibold text-white">
              {data?.user?.name || "CLI User"}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{data?.user?.email}</p>

            <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Account Active
            </div>
          </div>
        </CardContent>

        <CardFooter className="pb-8">
          <Button
            variant="outline"
            className="w-full border-zinc-700 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors h-12"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onError: (ctx) => console.log(ctx),
                  onSuccess: () => router.push("/sign-in"),
                },
              })
            }
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
