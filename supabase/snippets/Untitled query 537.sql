create policy "Full Access Task Attachments" on storage.objects
  as PERMISSIVE
  for ALL -- Deckt INSERT, SELECT, UPDATE und DELETE ab
  to anon, authenticated
  using (bucket_id = 'task-attachments')
  with check (bucket_id = 'task-attachments');