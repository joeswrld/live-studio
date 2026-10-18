-- Fix advisor warnings from the initial schema.
alter function public.set_updated_at() set search_path = public;
-- The signup trigger still fires; it just can't be called through the REST API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
