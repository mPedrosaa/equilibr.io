-- equilibr.io — catálogo de LEI, 1.º ano, 2.º semestre
-- Valores base recebidos do PR #25. As horas de contacto ficam a 0 até
-- validação com o horário oficial do curso.

insert into public.courses
  (id, code, name, ects, contact_hours, color, degree_code, year, semester, active)
values
  ('eng-software', 'ESOF', 'Engenharia de Software', 6, 0, '#000080', 'LEI', 1, 2, true),
  ('estatistica', 'ESTAT', 'Estatística', 5, 0, '#800080', 'LEI', 1, 2, true),
  ('lab-projeto-2', 'LP2', 'Laboratório / Projeto II', 8, 0, '#008000', 'LEI', 1, 2, true),
  ('matematica-discreta', 'MD', 'Matemática Discreta', 5, 0, '#c00000', 'LEI', 1, 2, true),
  ('paradigmas-programacao', 'PPROG', 'Paradigmas da Programação', 6, 0, '#b8860b', 'LEI', 1, 2, true)
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  ects = excluded.ects,
  contact_hours = excluded.contact_hours,
  color = excluded.color,
  degree_code = excluded.degree_code,
  year = excluded.year,
  semester = excluded.semester,
  active = excluded.active;
