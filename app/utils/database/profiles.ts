import { supabaseServer } from "../supabase/supabase.server";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
};

export const getProfile = async (): Promise<Profile | null> => {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select()
    .single();

  if (error) {
    return null;
  }

  return parseProfile(data);
};

export const createProfile = async (profile: Profile): Promise<boolean> => {
  const createProfile = await supabaseServer.from("profiles").insert(profile);
  if (createProfile.error) {
    return false;
  }

  return true;
};

const parseProfile = (data: any): Profile => {
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
  };
};
