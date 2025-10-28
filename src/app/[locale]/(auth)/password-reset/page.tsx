import { Suspense } from "react";
import PasswordResetForm from "../_components/password-reset/password-reset-form";
import { Loader2 } from "lucide-react";

const PasswordReset = () => {
  return (
    <div className="w-full flex flex-col items-center bg-main-blue min-h-screen justify-center p-5">
      <Suspense fallback={<><Loader2 className="animate-spin text-white" /></>}>
        <PasswordResetForm />
      </Suspense>
    </div>
  );
};

export default PasswordReset;
