-- Allow all logged-in users to read holidays.
-- Admin-only write policies remain unchanged.

drop policy if exists "holidays_select_admin" on public.holidays;
drop policy if exists "holidays_select_authenticated" on public.holidays;

create policy "holidays_select_authenticated"
on public.holidays
for select
to authenticated
using (true);
