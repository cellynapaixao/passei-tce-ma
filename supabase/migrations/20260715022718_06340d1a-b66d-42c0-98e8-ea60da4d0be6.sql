
-- 1) Normaliza edição
UPDATE public.exam_editions
SET name = 'TCE-MA 2026',
    organizer = 'Cebraspe',
    official_url = 'https://cdn.cebraspe.org.br/concursos/TCE_MA_26/arquivos/5FADC380CB030A07F557A9C5EEA6D063017A2CA675E683F39C50B65E6D70F57B.pdf',
    config = jsonb_build_object(
      'alternativas', 5,
      'gerais', 40,
      'especificos', 60,
      'peso_gerais', 1,
      'peso_especificos', 2,
      'total_objetivas', 100,
      'total_pontos', 160,
      'nota_minima', 64,
      'exam_dates', jsonb_build_object(
        'analista', '2026-11-22',
        'auditor',  '2026-11-29',
        'tecnico',  '2026-11-29'
      )
    )
WHERE slug = 'tce-ma-2026';

-- 2) Campo de formação exigida
ALTER TABLE public.positions ADD COLUMN IF NOT EXISTS formacao text;

-- 3) Preenchimento idempotente por code
UPDATE public.positions AS p SET formacao = v.formacao
FROM (VALUES
  ('analista-administracao', 'Administração'),
  ('analista-contabilidade', 'Ciências Contábeis'),
  ('analista-direito', 'Direito e registro na OAB'),
  ('analista-eng-telecom', 'Engenharia de Telecomunicações'),
  ('analista-eng-eletrica', 'Engenharia Elétrica'),
  ('analista-eng-mecanica', 'Engenharia Mecânica'),
  ('analista-estatistica', 'Estatística'),
  ('analista-medicina', 'Medicina'),
  ('analista-psicologia', 'Psicologia'),
  ('analista-ti', 'Curso superior na área de Tecnologia da Informação, conforme cursos e correlatos admitidos pelo edital'),
  ('auditor-atuariais', 'Ciências Atuariais'),
  ('auditor-controle-externo', 'Qualquer graduação reconhecida pelo MEC'),
  ('auditor-engenharia', 'Engenharia Civil'),
  ('auditor-medicina', 'Medicina'),
  ('auditor-ti', 'Curso superior na área de Tecnologia da Informação, conforme cursos e correlatos admitidos pelo edital'),
  ('tecnico-administrativa', 'Ensino médio')
) AS v(code, formacao)
WHERE p.code = v.code;
