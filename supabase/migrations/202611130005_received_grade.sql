-- equilibr.io — nota recebida nas avaliações realizadas

alter table public.assessments
  add column if not exists received_grade numeric(4, 2)
  check (received_grade is null or received_grade between 0 and 20);
