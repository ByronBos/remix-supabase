import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { signOutUser } from "~/utils/auth/supabase-auth.server";
import { defaultUnauthenticatedRoute, ROUTES } from "~/utils/routing/routes";
import { authCookie } from "~/utils/supabase/supabase.server";

export const loader: LoaderFunction = () => {
  return redirect("/");
};

export const action: ActionFunction = async ({ request }) => {
  let session = await authCookie.getSession(request.headers.get("Cookie"));
  if (!session) {
    return redirect(defaultUnauthenticatedRoute);
  }

  const { done, error } = await signOutUser(session);
  if (error || !done) {
    console.log("Failed to sign out user", error);
  }

  return redirect(defaultUnauthenticatedRoute, {
    headers: { "Set-Cookie": await authCookie.destroySession(session) },
  });
};

export default function SignOut() {
  return null;
}
