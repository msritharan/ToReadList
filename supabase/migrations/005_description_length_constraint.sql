-- Add constraint to limit description length to 1000 characters
alter table public.links 
alter column description type text,
alter column description set default null;

-- Add a check constraint to ensure description doesn't exceed 1000 characters
alter table public.links 
add constraint links_description_length_check 
check (char_length(description) <= 1000);
