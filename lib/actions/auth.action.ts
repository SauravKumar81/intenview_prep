"use server";

import { auth, db } from "@/firebase/admin";
import { AwardIcon } from "lucide-react";

import { cookies } from "next/headers";
import { success } from "zod";
const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const UserRecord = await db.collection("users").doc(uid).get();
    if (UserRecord.exists) {
      return {
        success: false,
        message: "Email already in exits",
      };
    }
    await db.collection("user").doc(uid).set({
      name,
      email,
    });
    return {
      success: true,
      message: "Accont created successfully.Please Sign in ",
    };
  } catch (e: any) {
    console.log("Error creating user:", e);
    if (e.code === "auth/email-already-exits") {
      return {
        success: false,
        message: "Email already in use",
      };
    }
    return {
      success: false,
      message: "Failed to create user",
    };
  }
}

export async function signIN(params: SignInParams) {
  const { email, idToken } = params;
  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User not found",
      };
    }
    await setSessionCookie(idToken);
  } catch (e) {
    console.log("Error signing in user:", e);
    return {
      success: false,
      message: "Failed to sign in user",
    };
  }
}
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set({
    name: "session",
    value: sessionCookie,
    maxAge: ONE_WEEK,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookiesStore = await cookies();

  const sessionCookie = cookiesStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("user").doc(decodedClaims.uid).get();

    if (!userRecord) {
      return null;
    }

    return{
        ... userRecord.data(),
        id: userRecord.id,
    }as User;
  } catch (e){
   
    console.log(e);
    return null;
  }
}

export async function isAuthentication() {
    const user = await getCurrentUser();
    // this !!user use that when we find unexisted value or existed value
    return !!user
    
}
