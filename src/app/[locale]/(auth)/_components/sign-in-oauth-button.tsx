"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/auth-client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

const SignInOauthButton = ({ text }: { text: string }) => {
  const [isPending, setIsPending] = useState<boolean>(false);
  //Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsPending(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `/dashboard`,
        errorCallbackURL: `/login`,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error?.message || "Opps! Something went wrong!");
      } else {
        toast.error("Opps! Something went wrong!");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isPending}
      className="w-full h-12 border-gray-300 cursor-pointer hover:bg-gray-50 rounded-full bg-light-gray text-gray-700"
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <FcGoogle className="size-7" />
          {text}
        </>
      )}
    </Button>
  );
};

export default SignInOauthButton;
