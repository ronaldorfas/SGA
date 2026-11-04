-- Execute primeiro APP/Banco_de_dados/schema-relacional.sql no SQL Editor
-- do Supabase. Este arquivo pode ser usado para reaplicar as permissões.
-- A service role key deve ficar somente no backend, nunca no frontend.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;