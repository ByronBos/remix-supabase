import { Provider } from "@supabase/supabase-js";
import { defaultAuthenticatedRoute } from "../routing/routes";
import { supabaseClient } from "../supabase/supabase.client";

interface IProps {
  provider: Provider;
  returnUrl?: string;
}

export const continueWithProvider = async ({
  provider,
  returnUrl = defaultAuthenticatedRoute,
}: IProps) => {
  const redirectUrl = `${window.location.origin}/callback?returnUrl=${returnUrl}`;

  return await supabaseClient.auth.signIn(
    {
      provider,
    },
    {
      redirectTo: redirectUrl,
    }
  );
};
