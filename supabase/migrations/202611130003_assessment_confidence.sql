-- equilibr.io — confiança das avaliações numa escala 0-10

alter table public.assessments
  drop constraint if exists assessments_confidence_check;

alter table public.assessments
  alter column confidence type smallint
  using (
    case confidence
      when 'baixa' then 2
      when 'media' then 5
      when 'alta' then 8
      else null
    end
  );

alter table public.assessments
  add constraint assessments_confidence_check
  check (confidence is null or confidence between 0 and 10);
