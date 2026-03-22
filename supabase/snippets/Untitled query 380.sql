create policy "Allow Insert for Task Attachments" on storage.objects
  as PERMISSIVE
  for INSERT -- Wichtig: Das hat gefehlt!
  to anon, authenticated
  with check (bucket_id = 'task-attachments');