# Relatório de Backend — Passei! TCE-MA 2026

Status: **APROVADO com pendência de conteúdo** (infraestrutura pronta; banco de questões vazio, como esperado nesta fase).

## 1. Resumo executivo

A base Supabase do aplicativo foi auditada em relação ao Edital nº 1 – TCE/MA (Cebraspe, 6 de julho de 2026). A edição, os 16 cargos, as políticas RLS, a RPC transacional `submit_attempt` e o algoritmo SRS `srs_sm2_next` estão presentes e íntegros. Foi aplicada uma migration idempotente para (a) padronizar o nome da edição para `TCE-MA 2026`, (b) enriquecer o `config` com peso de conhecimentos gerais, total de objetivas e datas oficiais e (c) acrescentar o campo `formacao` em `positions` com a exigência de escolaridade/registro de cada cargo, conforme edital.

Nenhuma questão foi inserida. O aplicativo permanece em estado vazio honesto até a curadoria publicar conteúdo autorizado.

## 2. Estado encontrado

- `exam_editions`: 1 registro (`tce-ma-2026`). Nome anterior "Concurso TCE-MA 2026"; `config` sem `peso_gerais`, `total_objetivas` nem `exam_dates`. Corrigido.
- `positions`: 16 registros exatos, com `code` estável, cargo/especialidade e datas coerentes (Analista 2026-11-22; Auditor e Técnico 2026-11-29). Sem campo `formacao`. Corrigido.
- `questions`: 0 registros.
- Usuários (`auth.users`): 5 contas já existentes.
- RLS por tabela (verificado em `pg_policies`):
  - `question_attempts`: INSERT `WITH CHECK auth.uid()=user_id`; SELECT `USING auth.uid()=user_id`. UPDATE/DELETE bloqueados pelo trigger `tg_block_attempt_mutation`.
  - `srs_states`, `study_sessions`, `study_profile_checkins`, `user_preferences`, `review_recommendations`: `FOR ALL USING/WITH CHECK auth.uid()=user_id`.
  - `questions`: leitura pública apenas quando `review_status='published'`; curadoria (`curator`/`admin`) lê e escreve todos os estados.
  - `exam_editions`, `positions`, `syllabus_nodes`, `question_syllabus_matches`, `question_position_matches`, `question_relationships`: leitura pública; escrita restrita a `admin`/`curator`.
  - `user_roles`: usuário lê apenas os próprios papéis.
- Funções: `submit_attempt` (SECURITY DEFINER, idempotente por `(user_id, client_attempt_id)`), `srs_sm2_next` (IMMUTABLE), `has_role` (SECURITY DEFINER, padrão Supabase para evitar recursão de RLS), triggers `tg_touch_updated_at` e `tg_block_attempt_mutation`.

## 3. Correções aplicadas

Migration criada nesta execução:

- `UPDATE exam_editions` para nome canônico e `config` completo (`peso_gerais=1`, `peso_especificos=2`, `total_objetivas=100`, `total_pontos=160`, `nota_minima=64`, `exam_dates`).
- `ALTER TABLE positions ADD COLUMN IF NOT EXISTS formacao text`.
- `UPDATE positions` preenchendo `formacao` por `code` para os 16 cargos, texto do edital.
- `listPositions` (`src/lib/editions.functions.ts`) passa a retornar `formacao`.

Migration idempotente: reexecução não cria nem duplica registros; só reafirma valores.

## 4. Evidências

### 4.1 Edição

```
name    = "TCE-MA 2026"
config  = {
  alternativas: 5, gerais: 40, especificos: 60,
  peso_gerais: 1, peso_especificos: 2,
  total_objetivas: 100, total_pontos: 160, nota_minima: 64,
  exam_dates: { analista: 2026-11-22, auditor: 2026-11-29, tecnico: 2026-11-29 }
}
official_url = https://cdn.cebraspe.org.br/concursos/TCE_MA_26/arquivos/5FADC380CB030A07F557A9C5EEA6D063017A2CA675E683F39C50B65E6D70F57B.pdf
```

### 4.2 Cargos (16)

Ordenados por cargo → especialidade, todos com `formacao` preenchida:

| # | code | cargo | especialidade | prova |
|---|------|-------|---------------|-------|
| 1 | analista-administracao | analista | Administração | 2026-11-22 |
| 2 | analista-contabilidade | analista | Contabilidade | 2026-11-22 |
| 3 | analista-direito | analista | Direito | 2026-11-22 |
| 4 | analista-eng-telecom | analista | Engenharia de Telecomunicações | 2026-11-22 |
| 5 | analista-eng-eletrica | analista | Engenharia Elétrica | 2026-11-22 |
| 6 | analista-eng-mecanica | analista | Engenharia Mecânica | 2026-11-22 |
| 7 | analista-estatistica | analista | Estatística | 2026-11-22 |
| 8 | analista-medicina | analista | Medicina | 2026-11-22 |
| 9 | analista-psicologia | analista | Psicologia | 2026-11-22 |
| 10 | analista-ti | analista | Tecnologia da Informação | 2026-11-22 |
| 11 | auditor-atuariais | auditor | Ciências Atuariais | 2026-11-29 |
| 12 | auditor-controle-externo | auditor | Controle Externo | 2026-11-29 |
| 13 | auditor-engenharia | auditor | Engenharia | 2026-11-29 |
| 14 | auditor-medicina | auditor | Medicina | 2026-11-29 |
| 15 | auditor-ti | auditor | Tecnologia da Informação | 2026-11-29 |
| 16 | tecnico-administrativa | tecnico | Técnico-Administrativa | 2026-11-29 |

### 4.3 Questões por estado

`questions`: 0 em todos os estados (`draft`, `needs_review`, `approved`, `published`, `deprecated`). Nada publicado; nada em curadoria. O treino operará em estado vazio honesto.

### 4.4 RLS

Consulta direta em `pg_policies` confirmou o mapa descrito em §2. Nenhuma política permissiva a `anon` sobre dados privados. A RPC `submit_attempt` é o único caminho autorizado para inserção em `question_attempts` e atualização de `srs_states`; a tentativa é imutável após criada (trigger).

### 4.5 Autenticação e persistência

Ambiente conectado: 5 usuários já existentes (validação prévia de signup/login realizada na Fase 1). Rotas atuais:
- `/auth` para signup, login e recuperação de sessão.
- `/_authenticated/*` protegido pelo gate `ssr:false` da integração.
- `/preferencias` grava em `user_preferences` (inclui `preferred_position_id`).
- Sessão de estudo criada por `sessions.functions.ts`; checkpoints por `checkpoints.functions.ts`.

Isolamento: as políticas `auth.uid() = user_id` impedem leitura cruzada; validado por RLS declarativa.

## 5. Pendências reais

1. **Conteúdo**: nenhuma questão publicada. O treino não entrega valor real até a curadoria importar itens com `review_status='published'` e vincular `question_position_matches` aos 16 cargos.
2. **Ferramenta de curadoria**: não há UI para importar/aprovar questões. Hoje depende de SQL manual por um usuário com papel `curator`/`admin`.
3. **Configuração de e-mail**: se a confirmação de e-mail estiver ativa no projeto, o cliente deve tratar `data.session === null` após `signUp` como "verifique seu e-mail", nunca como login concluído. Verificar no fluxo do Codex.

## 6. Riscos residuais

- Duas advertências do linter Supabase (WARN 0029) sobre funções `SECURITY DEFINER` executáveis por autenticados: são `has_role` e `submit_attempt`. Ambas são intencionais e seguem os padrões documentados do Supabase (evitar recursão de RLS e permitir escrita controlada em tabela imutável). Não devem ser revogadas.
- `service_role` só é usada em rotas server-side com import dinâmico (`client.server.ts`); não aparece em nenhum bundle do cliente.
- Sem cobertura editorial dos 16 cargos, seleção adaptativa retorna `null` de forma correta, mas o produto ainda não demonstra valor pedagógico ao usuário final.

## 7. Instruções para o Codex integrar o frontend

1. Consumir `listPositions()` de `@/lib/editions.functions` para popular seletores de cargo. Cada item agora inclui `formacao` (texto do edital) — use para tooltip/detalhe.
2. Consumir `getEdition()` para exibir datas e regras (`config.exam_dates`, `config.nota_minima`, `config.total_pontos`, `config.peso_especificos`).
3. Preferências: usar `getPreferences`/`updatePreferences`; `preferred_position_id` aceita `null` ou o `id` (UUID) de qualquer cargo retornado por `listPositions`.
4. Submissão de resposta: SEMPRE via `submitAttempt` com `client_attempt_id = crypto.randomUUID()` gerado no render da questão. Duplo clique é seguro (idempotente).
5. Sessão: `startSession`/`endSession` de `sessions.functions.ts`. Checkpoint a cada 5 respostas via `recordCheckin`.
6. Nunca chamar tabelas privadas com o client publishable direto — todo acesso privado passa por server function com `requireSupabaseAuth`.
7. Enquanto `questions` estiver vazio, `getNextQuestion` retorna `null`. Renderizar estado vazio honesto (não usar mocks).
8. Autenticação Google já suportada pela integração Lovable; qualquer novo provedor exige `supabase--configure_social_auth`.

## 8. Migrations criadas nesta execução

- `positions_formacao_and_edition_config` (idempotente): normaliza `exam_editions.name/config` e adiciona/preenche `positions.formacao`.

## 9. Arquivos alterados

- `src/lib/editions.functions.ts` — `listPositions` retorna `formacao`.
- `docs/LOVABLE_BACKEND_REPORT.md` — este relatório.
