import { useEffect } from "react";

import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { ActionFunction, redirect } from "@remix-run/node";
import { updateAuthSession } from "~/utils/auth/supabase-auth.server";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { supabaseClient } from "~/utils/supabase/supabase.client";
import { authCookie, supabaseServer } from "~/utils/supabase/supabase.server";
import { defaultAuthenticatedRoute, ROUTES } from "~/utils/routing/routes";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const formDataSession = formData.get("session") as string | null;
  const event = formData.get("event") as AuthChangeEvent | null;
  const returnUrl =
    String(formData.get("returnUrl")) || defaultAuthenticatedRoute;
  if (!formDataSession || !event) {
    return redirect(ROUTES.signIn);
  }

  const SupabaseSession: Session = JSON.parse(formDataSession);

  let session = await authCookie.getSession(request.headers.get("Cookie"));
  const { access_token: accessToken, refresh_token: refreshToken } =
    SupabaseSession;

  supabaseServer.auth.setAuth(accessToken);
  session = await updateAuthSession(
    SupabaseSession.user,
    session,
    accessToken,
    refreshToken || ""
  );

  if (event === "SIGNED_IN") {
    return redirect(returnUrl, {
      headers: {
        "Set-Cookie": await authCookie.commitSession(session),
      },
    });
  }

  redirect(ROUTES.signIn);
};

export default function authCallback() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        const formData = new FormData();
        formData.append("session", JSON.stringify(session));
        formData.append("event", event);
        formData.append(
          "returnUrl",
          searchParams.get("returnUrl") || defaultAuthenticatedRoute
        );

        fetcher.submit(formData, { method: "post" });
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetcher, searchParams]);

  return null;
}
