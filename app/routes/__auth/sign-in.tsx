import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import AuthProviderButton from "~/components/auth-provider-button";
import authenticated from "~/policies/authenticated.server";
import {
  signInUser,
  updateAuthSession,
} from "~/utils/auth/supabase-auth.server";
import { defaultAuthenticatedRoute } from "~/utils/routing/routes";
import { getReturnUrl } from "~/utils/routing/routing.server";
import { authCookie, supabaseServer } from "~/utils/supabase/supabase.server";

type ActionResponse = {
  error: string;
};

export const action: ActionFunction = async ({ request }) => {
  let session = await authCookie.getSession(request.headers.get("Cookie"));

  const form = await request.formData();

  const email = form.get("email") as string;
  const password = form.get("password") as string;
  const returnUrl = form.get("returnUrl") as string;

  if (!email || !password) {
    return json<ActionResponse>({
      error: "Email and Password are required",
    });
  }

  const { accessToken, refreshToken, error, user } = await signInUser({
    email,
    password,
  });

  if (error || !accessToken || !refreshToken) {
    console.log(error);
    return json<ActionResponse>({
      error: error?.toString() || "Something went wrong",
    });
  }
  supabaseServer.auth.setAuth(accessToken);
  session = await updateAuthSession(
    user || null,
    session,
    accessToken,
    refreshToken
  );
  return redirect(returnUrl || defaultAuthenticatedRoute, {
    headers: { "Set-Cookie": await authCookie.commitSession(session) },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  let session = await authenticated({ request, allowUnauthenticated: true });
  if (session) {
    return redirect(getReturnUrl(request) || "/");
  }

  return null;
};

const SignIn = () => {
  const response = useActionData<ActionResponse>();
  const transition = useTransition();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? defaultAuthenticatedRoute;

  return (
    <section>
      <h2 className="text-3xl font-light">
        Sign <strong className="font-bold">in</strong>
      </h2>
      <Form method="post" className="my-3 lg:w-3/4">
        <div className="mb-2">
          <label
            className="mb-2 text-sm font-bold text-gray-400"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-400 shadow focus:outline-none"
            type="email"
            placeholder="Your email"
            name="email"
          />
        </div>
        <div className="mb-2">
          <label
            className="mb-2 text-sm font-bold text-gray-400"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-400 shadow focus:outline-none"
            type="password"
            name="password"
            placeholder="Your password"
          />
        </div>
        <input type="hidden" name="returnUrl" value={returnUrl} />
        <div>
          <button
            type="submit"
            className="focus:shadow-outline mt-3 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
            aria-live="polite"
            disabled={transition.state !== "idle"}
          >
            {transition.state !== "idle" ? "Loading..." : "Sign in"}
          </button>
          {response?.error ? (
            <p className="text-xs italic text-red-500">{response.error}</p>
          ) : null}
        </div>
      </Form>
      <div className="mt-4">
        <AuthProviderButton provider="google" returnUrl={returnUrl} />
      </div>
    </section>
  );
};
export default SignIn;
