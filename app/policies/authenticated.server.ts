import { redirect } from "@remix-run/node";
import { SessionUser } from "~/types";
import {
  getAccessTokenFromSession,
  getRefreshTokenFromSession,
  getUserFromSession,
  updateAuthSession,
  validateAccessToken,
} from "~/utils/auth/supabase-auth.server";
import { getProfile } from "~/utils/database/profiles";
import { ROUTES } from "~/utils/routing/routes";
import {
  getCurrentPath,
  makeReturnUrl,
  redirectToSignInWithReturnUrl,
} from "~/utils/routing/routing.server";
import { authCookie, supabaseServer } from "~/utils/supabase/supabase.server";

export default async function authenticated(props: {
  request: Request;
  allowUnauthenticated?: boolean;
}): Promise<SessionUser | null> {
  const { request, allowUnauthenticated } = props;
  // Possibilities

  // 1. No auth at all
  //    Redirect to the sign in page

  // 2. All authenticated
  //    Redirect to wherever the redirectTo prop points, or some default page

  // 3. Authenticated but no profile (likely to happen if signed up via oAuth but didn't complete their profile)
  //    Redirect to the complete profile page
  let session = await authCookie.getSession(request.headers.get("Cookie"));

  let accessToken = getAccessTokenFromSession(session);
  let refreshToken = getRefreshTokenFromSession(session);
  let user = getUserFromSession(session);

  if (!accessToken || !refreshToken) {
    if (allowUnauthenticated) {
      return null;
    }

    throw redirectToSignInWithReturnUrl(request);
  }

  if (!(await validateAccessToken(accessToken))) {
    // TODO Try and refresh the token
    if (allowUnauthenticated) {
      return null;
    }

    throw redirectToSignInWithReturnUrl(request);
  }

  // Do this now that we're confident the token is correct
  supabaseServer.auth.setAuth(accessToken);

  if (!user) {
    let [profile, { user: supabaseUser }] = await Promise.all([
      getProfile(),
      supabaseServer.auth.api.getUser(accessToken),
    ]);

    if (!profile) {
      let path = getCurrentPath(request);

      // This user doesn't have a profile set up, we should change that!
      if (path.startsWith(ROUTES.completeProfile)) {
        return null;
      } else {
        throw redirect(`${ROUTES.completeProfile}?${makeReturnUrl(request)}`);
      }
    }

    // They do have a profile! It just somehow wasn't stored in their session
    // Not sure if there's a feasible way for this to occur
    // But hey, if it's a get request we'll update their session as reload
    session = await updateAuthSession(
      supabaseUser,
      session,
      accessToken,
      refreshToken
    );
    if (request.method.toLowerCase() === "get") {
      throw redirect(request.url, {
        headers: { "Set-Cookie": await authCookie.commitSession(session) },
      });
    }
  }

  // If we're here everything is looking good!
  return user;
}
