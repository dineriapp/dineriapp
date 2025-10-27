import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

// Only exporting things that needed
export const {
  signIn,
  signOut,
  useSession,
  $fetch,
  sendVerificationEmail,
  signUp,
  forgetPassword,
  resetPassword,
  updateUser,
  changePassword,
  changeEmail,
} = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
  fetchOptions: {
    credentials: "include",
  }
});
