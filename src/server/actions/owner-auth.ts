"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

const OWNER_LOGIN_ERROR_REDIRECT = "/auth/login?error=CredentialsSignin";

export async function ownerSignInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "")
    .trim()
    .slice(0, 80);
  const password = String(formData.get("password") ?? "").slice(0, 128);
  const honeypot = String(formData.get("website") ?? "").trim();

  if (!username || !password || honeypot) {
    redirect(OWNER_LOGIN_ERROR_REDIRECT);
  }

  try {
    await signIn("credentials", {
      scope: "ADMIN",
      loginMode: "PASSWORD",
      email: username.toLowerCase(),
      password,
      redirectTo: "/dashboard/owner",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(OWNER_LOGIN_ERROR_REDIRECT);
    }
    throw error;
  }
}
