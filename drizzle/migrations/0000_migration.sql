CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Cuddles friend',
  liked_effects text[] NOT NULL DEFAULT '{}',
  liked_flavours text[] NOT NULL DEFAULT '{}',
  liked_topics text[] NOT NULL DEFAULT '{}',
  favourite_strains text[] NOT NULL DEFAULT '{}',
  discoverable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);
CREATE UNIQUE INDEX connections_pair_uidx ON public.connections (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connections TO authenticated;
GRANT ALL ON public.connections TO service_role;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.are_connected(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.connections WHERE status='accepted'
    AND ((requester_id=_a AND addressee_id=_b) OR (requester_id=_b AND addressee_id=_a)))
$$;

CREATE POLICY "View discoverable, own or connected profiles" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR discoverable OR public.are_connected(auth.uid(), user_id));
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own profile" ON public.profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "See own connections" ON public.connections FOR SELECT TO authenticated
  USING (auth.uid() IN (requester_id, addressee_id));
CREATE POLICY "Send invites" ON public.connections FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() AND status = 'pending');
CREATE POLICY "Invitee responds" ON public.connections FOR UPDATE TO authenticated
  USING (addressee_id = auth.uid()) WITH CHECK (addressee_id = auth.uid() AND status IN ('accepted','declined'));
CREATE POLICY "Either side removes" ON public.connections FOR DELETE TO authenticated
  USING (auth.uid() IN (requester_id, addressee_id));

CREATE OR REPLACE FUNCTION public.protect_connection_parties()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.requester_id <> OLD.requester_id OR NEW.addressee_id <> OLD.addressee_id THEN
    RAISE EXCEPTION 'Connection parties cannot change';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER connections_protect BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.protect_connection_parties();

CREATE TABLE public.shared_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('strain','article')),
  item_slug text NOT NULL CHECK (char_length(item_slug) BETWEEN 1 AND 200),
  item_title text NOT NULL CHECK (char_length(item_title) BETWEEN 1 AND 200),
  note text CHECK (note IS NULL OR char_length(note) <= 300),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shared_items TO authenticated;
GRANT ALL ON public.shared_items TO service_role;
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "See own shares" ON public.shared_items FOR SELECT TO authenticated
  USING (auth.uid() IN (sender_id, recipient_id));
CREATE POLICY "Share with connections" ON public.shared_items FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.are_connected(auth.uid(), recipient_id));
CREATE POLICY "Recipient marks read" ON public.shared_items FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
CREATE POLICY "Recipient deletes" ON public.shared_items FOR DELETE TO authenticated
  USING (recipient_id = auth.uid());