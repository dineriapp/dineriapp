import { Role, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { betterAuth, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import prisma from "../prisma";
import { normalizeName, VALID_DOMAINS } from "./utils";
import { hashPassword, verifyPassword } from "./argon2";
import { sendEmailAction } from "./send-email.action";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60, // 1 hour
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: User;
      url: string;
    }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/verify");
      await sendEmailAction({
        to: user.email,
        subject: "Verify your email address",
        html: `
              <div style="">
              <h1 style="">Verify your email address</h1>
              <p style="">Please verify your email address to complete the registration process.</p>
              <a href="${link}" style="">Click Here</a>
              </div>
              `,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmailAction({
        to: user.email,
        subject: "Reset your password",
        html: `
              <div style="">
              <h1 style="">Reset your password</h1>
              <p style="">Please click the link below to reset your password.</p>
              <a href="${url}" style="">Click Here</a>
              </div>
              `,
      });
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body.email);
        const domain = email.split("@")[1].toLowerCase();

        if (!VALID_DOMAINS().includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Opps! Invalid domain. Please use a valid email.",
          });
        }
      }

      if (ctx.path === "/sign-in/magic-link") {
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } },
        };
      }

      if (ctx.path === "/update-user") {
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } },
        };
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") ?? [];

          if (ADMIN_EMAILS.includes(user.email)) {
            return { data: { ...user, role: Role.ADMIN } };
          }

          return { data: { ...user, role: Role.USER } };
        },
      },
    },
  },
  // for user
  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"] as Array<Role>,
        input: false,
      },
      phone: {
        type: "string",
        input: false,
      },
      subscription_plan: {
        type: ["basic", "pro", "enterprise"] as Array<SubscriptionPlan>,
        input: false,
      },
      subscription_status: {
        type: ["active", "inactive", "past_due"] as Array<SubscriptionStatus>,
        input: false,
      },
      stripe_customer_id: {
        type: "string",
        input: false,
      },
      stripe_subscription_id: {
        type: "string",
        input: false,
      },
      subscription_current_period_start: {
        type: "date",
        input: false,
      },
      subscription_current_period_end: {
        type: "date",
        input: false,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url }) => {
        await sendEmailAction({
          to: user.email,
          subject: "Verify your new email address",
          html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h1 style="color: #333;">Verify your new email address</h1>
        <p style="color: #555;">
          You recently requested to change your email address on your account. 
          Please click the button below to verify your new email address.
        </p>
        <a href="${url}" 
           style="display: inline-block; padding: 10px 20px; margin-top: 10px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
        <p style="color: #777; font-size: 14px; margin-top: 20px;">
          If you did not request this change, please ignore this email.
        </p>
      </div>
    `,
        });
      },

    }
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  telemetry: {
    enabled: false
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [String(process.env.BETTER_AUTH_URL)],
  plugins: [
    nextCookies(),
  ],
});

export type ErrorCodeBetterAuth = keyof typeof auth.$ERROR_CODES | "UNKNOWN";
