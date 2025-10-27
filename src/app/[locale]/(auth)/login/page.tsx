import { Suspense } from "react";
import LoginForm from "../_components/login/login-form";

const LogInPage = () => {
  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-main-blue justify-center p-5">
      <Suspense fallback={<>Loading...</>}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LogInPage;
