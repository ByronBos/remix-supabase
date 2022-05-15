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
import authenticated from "~/policies/authenticated.server";
import {
  getAccessTokenFromSession,
  getUserByAccessToken,
  updateAuthSession,
} from "~/utils/auth/supabase-auth.server";
import { createProfile } from "~/utils/database/profiles";
import { defaultAuthenticatedRoute } from "~/utils/routing/routes";
import { getReturnUrl } from "~/utils/routing/routing.server";
import { authCookie, supabaseServer } from "~/utils/supabase/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {
  let sessionUser = await authenticated({ request });

  if (sessionUser) {
    return redirect(getReturnUrl(request) || "/");
  }

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const errors: {
    firstName?: string;
    lastName?: string;
    server?: string;
  } = {};

  let session = await authCookie.getSession(request.headers.get("Cookie"));
  let accessToken = getAccessTokenFromSession(session);
  if (!accessToken) {
    return null; // TODO error handling
  }

  let { user, error } = await getUserByAccessToken(accessToken);
  if (!user || error) {
    return null; // TODO error handling
  }

  let supabaseSession = supabaseServer.auth.setAuth(accessToken);

  try {
    const form = await request.formData();
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const returnUrl = form.get("returnUrl") as string;

    // validate the fields
    if (!firstName) {
      errors.firstName = "First name is required";
    }
    if (!lastName) {
      errors.lastName = "Last name is required";
    }

    // return data if we have errors
    if (Object.keys(errors).length) {
      return json({ errors }, { status: 422 });
    }

    let success = await createProfile({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
    });

    updateAuthSession(
      user,
      session,
      accessToken,
      supabaseSession.refresh_token || ""
    );

    return redirect(returnUrl || defaultAuthenticatedRoute, {
      headers: { "Set-Cookie": await authCookie.commitSession(session) },
    });
  } catch (error: any) {
    console.log("error", error);
    errors.server = error?.message || error;
    return json({ errors }, { status: 500 });
  }
};

const CompleteProfile = () => {
  const data = useActionData();
  const transition = useTransition();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? defaultAuthenticatedRoute;

  return (
    <section>
      <h2 className="text-3xl font-light">Complete profile</h2>
      <p className="block">We're thrilled you're here!</p>
      <p>We just need a little bit more information to get going.</p>
      <Form method="post" className="my-3">
        <div className="mb-2">
          <label
            className="mb-2 text-sm font-bold text-gray-400"
            htmlFor="firstName"
          >
            First name
          </label>
          <input
            id="firstName"
            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-400 shadow focus:outline-none"
            type="text"
            placeholder="Your first name"
            name="firstName"
          />
          {data?.errors?.firstName ? (
            <p className="text-xs italic text-red-500">
              {data?.errors.firstName}
            </p>
          ) : null}
        </div>
        <div className="mb-2">
          <label
            className="mb-2 text-sm font-bold text-gray-400"
            htmlFor="lastName"
          >
            Last name
          </label>
          <input
            id="lastName"
            className="focus:shadow-outline w-full appearance-none rounded border py-2 px-3 leading-tight text-gray-400 shadow focus:outline-none"
            type="text"
            placeholder="Your last name"
            name="lastName"
          />
          {data?.errors?.lastName ? (
            <p className="text-xs italic text-red-500">
              {data?.errors.lastName}
            </p>
          ) : null}
        </div>
        <input type="hidden" name="returnUrl" value={returnUrl} />
        <div>
          <button
            type="submit"
            className="focus:shadow-outline mt-3 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
            aria-live="polite"
          >
            {transition.state !== "idle" ? "Loading..." : "Save"}
          </button>
          {data?.errors?.server ? (
            <p className="text-xs italic text-red-500">{data?.errors.server}</p>
          ) : null}
        </div>
      </Form>
    </section>
  );
};
export default CompleteProfile;
