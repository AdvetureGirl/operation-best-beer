
alter table public.operation_state
  add column if not exists scheduler_armed boolean not null default false,
  add column if not exists first_call_done boolean not null default false,
  add column if not exists first_call_at timestamptz,
  add column if not exists next_call_at timestamptz,
  add column if not exists last_call_at timestamptz;

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname='scarlet-scheduler-minute') then
    perform cron.unschedule('scarlet-scheduler-minute');
  end if;
end $$;

select cron.schedule(
  'scarlet-scheduler-minute',
  '* * * * *',
  $$
  select net.http_post(
    url:='https://ghwaubanhswjpocsmiwi.supabase.co/functions/v1/send-host-push',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer sb_publishable_c6PrOCrmlTQpC8sErrFjjA_BAJmIcDl","apikey":"sb_publishable_c6PrOCrmlTQpC8sErrFjjA_BAJmIcDl"}'::jsonb,
    body:='{"mode":"tick"}'::jsonb
  );
  $$
);
