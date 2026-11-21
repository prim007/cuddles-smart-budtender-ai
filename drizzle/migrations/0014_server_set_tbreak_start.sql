CREATE OR REPLACE FUNCTION public.protect_tolerance_break_dates()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.start_date := now();
    NEW.created_at := now();
    NEW.status := CASE WHEN NEW.status = 'completed' THEN 'active' ELSE COALESCE(NEW.status, 'active') END;
  ELSE
    NEW.start_date := OLD.start_date;
    NEW.created_at := OLD.created_at;
    NEW.target_days := OLD.target_days;
  END IF;
  IF NEW.target_days IS NULL OR NEW.target_days < 1 OR NEW.target_days > 365 THEN
    RAISE EXCEPTION 'Target days must be between 1 and 365';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_protect_tolerance_break_dates ON public.tolerance_breaks;
CREATE TRIGGER trg_protect_tolerance_break_dates BEFORE INSERT OR UPDATE ON public.tolerance_breaks
FOR EACH ROW EXECUTE FUNCTION public.protect_tolerance_break_dates();