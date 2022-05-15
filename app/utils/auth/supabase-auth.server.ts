import { supabaseServer } from "~/utils/supabase/supabase.server";
import type { Error, SessionUser } from "~/types";

import type { User } from "@supabase/supabase-js";
import { Session } from "@remix-run/node";
import { atob } from "@remix-run/node/base64";
import { getProfile } from "../database/profiles";

type AuthForm = {
  email: string;
  password: string;
};

export function getAccessTokenFromSession(session: Session): string | null {
  return session.get("access_token") || null;
}

export function getRefreshTokenFromSession(session: Session): string | null {
  return session.get("access_token") || null;
}

export function getUserFromSession(session: Session): SessionUser | null {
  return (session.get("user") as SessionUser) || null;
}

export async function validateAccessToken(
  token: string,
  checkServer: boolean = false
): Promise<boolean> {
  if (checkServer) {
    let { user, data, error } = await supabaseServer.auth.api.getUser(token);
    return !error && !!user;
  } else {
    let jwt = JSON.parse(atob(token.split(".")[1]));
    let expiresAt = new Date(jwt.exp * 1000);
    let hasExpired = expiresAt < new Date();

    if (hasExpired) {
      return false;
    }

    return true;
  }
}

export async function updateAuthSession(
  supabaseUser: User | null,
  session: Session,
  accessToken: string,
  refreshToken: string
): Promise<Session> {
  session.set("access_token", accessToken);
  session.set("refresh_token", refreshToken);

  // Get the user profile and set that also
  let profile = await getProfile();
  if (profile) {
    const user: SessionUser = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: supabaseUser?.email || "",
    };
    session.set("user", user);
  }

  return session;
}

function hasAuthSession(session: Session): boolean {
  try {
    return session.has("access_token") && session.has("user");
  } catch {
    return false;
  }
}

export async function hasValidAccessToken(
  session: Session,
  checkServer = false
): Promise<boolean> {
  try {
    let jwt = JSON.parse(atob(session.get("access_token").split(".")[1]));
    let expiresAt = new Date(jwt.exp * 1000);
    let hasExpired = expiresAt < new Date();

    if (hasExpired) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function getSessionUser(
  session: Session
): Promise<SessionUser | null> {
  if (!hasActiveAuthSession(session)) {
    return null;
  }

  // If we get here we have a valid session and user
  return (session.get("user") as SessionUser) || null;
}

export async function hasActiveAuthSession(session: Session): Promise<boolean> {
  try {
    if (!hasAuthSession(session)) return false;

    const { user, error } = await getUserByAccessToken(
      session.get("access_token")
    );

    if (error || !user) return false;
    return true;
  } catch {
    return false;
  }
}

export async function refreshUserToken(session: Session): Promise<LoginReturn> {
  try {
    const { data, error } = await supabaseServer.auth.api.refreshAccessToken(
      session.get("refresh_token")
    );

    if (error || !data || !data.access_token || !data.refresh_token) {
      return { error: error?.message || "Something went wrong" };
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

type LoginReturn = {
  accessToken?: string;
  refreshToken?: string;
  user?: User;
} & Error;
export async function signInUser({
  email,
  password,
}: AuthForm): Promise<LoginReturn> {
  try {
    const { data: sessionData, error: loginError } =
      await supabaseServer.auth.api.signInWithEmail(email, password);

    if (
      loginError ||
      !sessionData ||
      !sessionData.access_token ||
      !sessionData.refresh_token
    ) {
      return { error: loginError?.message || "Something went wrong" };
    }

    return {
      accessToken: sessionData.access_token,
      refreshToken: sessionData.refresh_token,
      user: sessionData.user || undefined,
    };
  } catch {
    return { error: "Something went wrong" };
  }
}

type RegisterReturn = {
  user?: User;
} & Error;
export async function registerUser({
  email,
  password,
}: AuthForm): Promise<RegisterReturn> {
  try {
    const { user, error: signUpError } = await supabaseServer.auth.signUp({
      email,
      password,
    });

    if (signUpError || !user) {
      return { error: signUpError?.message || "Something went wrong" };
    }

    return { user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}

type SignOutUserReturn = {
  done: boolean;
} & Error;
export async function signOutUser(
  session: Session
): Promise<SignOutUserReturn> {
  try {
    const { error } = await supabaseServer.auth.api.signOut(
      session.get("access_token")
    );
    if (error) {
      return { done: false, error: error?.message || "Something went wrong" };
    }
    return { done: true };
  } catch {
    return {
      done: false,
      error: "Something went wrong",
    };
  }
}

type GetUserReturn = {
  user?: User;
} & Error;
export async function getUserByAccessToken(
  accessToken: string
): Promise<GetUserReturn> {
  try {
    const { user, error } = await supabaseServer.auth.api.getUser(accessToken);

    if (error || !user) {
      return { error: error?.message || "Something went wrong" };
    }

    return { user };
  } catch {
    return {
      error: "Something went wrong",
    };
  }
}
