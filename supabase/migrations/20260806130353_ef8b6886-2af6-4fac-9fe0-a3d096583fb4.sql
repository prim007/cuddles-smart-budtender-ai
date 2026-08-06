insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users
where email in ('primncube55@gmail.com','tripple4442@gmail.com')
on conflict (user_id, role) do nothing;