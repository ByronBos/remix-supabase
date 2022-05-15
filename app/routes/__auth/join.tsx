import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import authenticated from "~/policies/authenticated.server";
import { updateAuthSession } from "~/utils/auth/supabase-auth.server";
import { createProfile } from "~/utils/database/profiles";
import { defaultAuthenticatedRoute } from "~/utils/routing/routes";
import { getReturnUrl } from "~/utils/routing/routing.server";
import { authCookie, supabaseServer } from "~/utils/supabase/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {
  let session = await authenticated({ request, allowUnauthenticated: true });
  if (session) {
    return redirect(getReturnUrl(request) || "/");
  }

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    server?: string;
  } = {};

  try {
    const form = await request.formData();
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    // validate the fields
    if (!firstName) {
      errors.firstName = "First name is required";
    }
    if (!lastName) {
      errors.lastName = "Last name is required";
    }
    if (!email || !email.match(/^\S+@\S+$/)) {
      errors.email = "Email address is invalid";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be > 6 characters";
    }

    // return data if we have errors
    if (Object.keys(errors).length) {
      return json({ errors }, { status: 422 });
    }

    const {
      user,
      session: supabaseSession,
      error,
    } = await supabaseServer.auth.signUp({
      email,
      password,
    });

    if (user && !error) {
      await createProfile({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
      });
    }

    if (supabaseSession?.access_token && supabaseSession.refresh_token) {
      let session = await authCookie.getSession(request.headers.get("Cookie"));
      session = await updateAuthSession(
        user,
        session,
        supabaseSession.access_token,
        supabaseSession.refresh_token
      );

      let returnUrl = "";
      return redirect(returnUrl || defaultAuthenticatedRoute, {
        headers: { "Set-Cookie": await authCookie.commitSession(session) },
      });
    }

    return json({ success: false, error: "Sorry, something went wrong" });
  } catch (error: any) {
    console.log("error", error);
    errors.server = error?.message || error;
    return json({ errors }, { status: 500 });
  }
};

const Join = () => {
  const data = useActionData();
  const transition = useTransition();
  return (
    <section>
      <h2 className="text-3xl font-light">Join</h2>
      <Form method="post" className="my-3">
        {data?.user && (
          <div
            className="relative mb-4 rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
            role="alert"
          >
            <strong className="font-bold">Congrats! </strong>
            <span className="block sm:inline">
              Your account has been created. Please go to your email for
              confirmation instructions.
            </span>
          </div>
        )}
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
          {data?.errors?.email ? (
            <p className="text-xs italic text-red-500">{data?.errors.email}</p>
          ) : null}
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
          {data?.errors?.password ? (
            <p className="text-xs italic text-red-500">
              {data?.errors.password}
            </p>
          ) : null}
        </div>
        <div>
          <button
            type="submit"
            className="focus:shadow-outline mt-3 rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
            aria-live="polite"
          >
            {transition.state !== "idle" ? "Loading..." : "Join"}
          </button>
          {data?.errors?.server ? (
            <p className="text-xs italic text-red-500">{data?.errors.server}</p>
          ) : null}
        </div>
      </Form>
    </section>
  );
};
export default Join;
