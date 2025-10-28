import { Suspense } from "react";
import LoginForm from "../_components/login/login-form";
import { Loader2 } from "lucide-react";

const LogInPage = () => {
  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-main-blue justify-center p-5">
      <Suspense fallback={<><Loader2 className="animate-spin text-white" /></>}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LogInPage;
