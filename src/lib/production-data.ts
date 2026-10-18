import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProductionSession = Tables<"production_sessions">;
export type Recording = Tables<"recordings">;
export type Profile = Tables<"profiles">;

export async function getProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Sign in to view your account.");
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, created_at, updated_at")
    .eq("id", authData.user.id)
    .single();
  if (error) throw error;
  return data;
}

export async function listSessions() {
  const { data, error } = await supabase
    .from("production_sessions")
    .select("id, owner_id, name, description, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createSession(name: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Sign in to create a session.");
  const { data, error } = await supabase
    .from("production_sessions")
    .insert({ name: name.trim(), owner_id: authData.user.id })
    .select("id, owner_id, name, description, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function renameSession(id: string, name: string) {
  const { data, error } = await supabase
    .from("production_sessions")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, owner_id, name, description, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function removeSession(id: string) {
  const { error } = await supabase.from("production_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function getSession(id: string) {
  const { data, error } = await supabase
    .from("production_sessions")
    .select("id, owner_id, name, description, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listRecordings() {
  const { data, error } = await supabase
    .from("recordings")
    .select("id, owner_id, session_id, title, status, duration_seconds, storage_path, metadata, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateDisplayName(displayName: string) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error("Sign in to update your profile.");
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
    .eq("id", authData.user.id)
    .select("id, display_name, avatar_url, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}