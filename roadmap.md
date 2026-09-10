# Roadmap — Passei! TCE-MA

## Concluído
- Dados oficiais do certame atualizados no banco (40 vagas, remuneração até R$ 20.112,20, inscrições 17/07–21/08/2026 encerradas, Edital nº 1 de 06/07/2026 e retificação nº 2 de 29/07/2026).
- Painel "Status oficial do certame" na página inicial, com contagem regressiva por cargo.
- Gerador de questões pronto em `/tmp/gen/gen_questions.py` (260 itens, 14 temas, múltipla escolha de 5 e certo/errado, salvamento incremental).

## Bloqueado
- Carga das 260 questões no banco. A geração parou com "créditos de IA insuficientes" após cerca de 110 itens. Retomar após recarga de créditos: rodar o gerador e inserir `/tmp/gen/questions.json` em `public.questions` + `question_position_matches`.
