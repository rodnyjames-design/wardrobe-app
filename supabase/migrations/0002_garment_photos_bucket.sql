-- Storage bucket for garment photos.
-- Private bucket: photos are only accessible via signed URLs generated for the owner.
-- Per-user folder: every object's key MUST start with "<user_id>/" so RLS can scope by ownership.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'garment-photos',
  'garment-photos',
  false,                                  -- private
  5 * 1024 * 1024,                        -- 5 MB per file
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
set public            = excluded.public,
    file_size_limit   = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS policies. The owner of an object is whoever's user_id is the
-- first path segment (e.g. "abc123/garment-1.jpg" → owner is user abc123).

create policy "Users can read their own garment photos"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'garment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload to their own garment-photos folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'garment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own garment photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'garment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'garment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own garment photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'garment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
