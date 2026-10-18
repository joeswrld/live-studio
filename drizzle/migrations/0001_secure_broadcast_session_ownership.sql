ALTER TABLE public.production_sessions
  ALTER COLUMN owner_id SET DEFAULT auth.uid(),
  ADD CONSTRAINT production_sessions_owner_profile_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.recordings
  ALTER COLUMN owner_id SET DEFAULT auth.uid(),
  ADD CONSTRAINT recordings_owner_profile_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.enforce_recording_session_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.session_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.production_sessions s
    WHERE s.id = NEW.session_id AND s.owner_id = NEW.owner_id
  ) THEN
    RAISE EXCEPTION 'Recording session must belong to the recording owner';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER recordings_session_owner_check
BEFORE INSERT OR UPDATE OF session_id, owner_id ON public.recordings
FOR EACH ROW EXECUTE FUNCTION public.enforce_recording_session_owner();