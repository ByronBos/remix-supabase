import { redirect } from "@remix-run/node";
import { ROUTES } from "./routes";

export const redirectToSignInWithReturnUrl = (request: Request): Response => {
  return redirect(`${ROUTES.signIn}?${makeReturnUrl(request)}`);
};

export const getCurrentPath = (request: Request) => {
  return new URL(request.url).pathname;
};

export const makeReturnUrl = (request: Request) => {
  return new URLSearchParams([["returnUrl", getCurrentPath(request)]]);
};

export const getReturnUrl = (request: Request) => {
  const url = new URL(request.url);
  return url.searchParams.get("returnUrl");
};
