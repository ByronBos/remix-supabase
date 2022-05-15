import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";

// TODO may not need this
export const loader: LoaderFunction = async ({ request }) => {
  // await refreshAccessToken(request);

  // refreshAccessToken will throw a redirect on successful redirect, so we only get here if that fails
  return redirect("/sign-in");
};
