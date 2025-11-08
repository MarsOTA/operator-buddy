-- Abilita estensioni per cron job
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Tabella per tracciare le notifiche inviate (evita duplicati)
CREATE TABLE IF NOT EXISTS public.sent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL,
  operator_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(shift_id, operator_id, notification_type)
);

-- Abilita RLS
ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: gli operatori possono vedere solo le loro notifiche
CREATE POLICY "Users can view their own sent notifications"
  ON public.sent_notifications
  FOR SELECT
  USING (auth.uid() = operator_id);

-- Policy: solo il sistema può inserire notifiche
CREATE POLICY "System can insert sent notifications"
  ON public.sent_notifications
  FOR INSERT
  WITH CHECK (true);

-- Indice per performance
CREATE INDEX idx_sent_notifications_shift_operator 
  ON public.sent_notifications(shift_id, operator_id, notification_type);