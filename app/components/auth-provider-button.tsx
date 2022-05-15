import { Provider } from "@supabase/supabase-js";
import React, { useCallback } from "react";
import { continueWithProvider } from "~/utils/auth/supabase-auth.client";

type Props = {
  provider: Provider;
  returnUrl?: string;
} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function AuthProviderButton({
  provider,
  returnUrl,
  ...props
}: Props) {
  const onClick = useCallback(async () => {
    try {
      await continueWithProvider({ provider, returnUrl });
    } catch (error) {
      console.log(error);

      return;
    }
  }, [provider, returnUrl]);
  return (
    <button {...props} onClick={onClick}>
      Continue with {provider}
    </button>
  );
}
