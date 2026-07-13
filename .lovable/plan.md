## Escopo desta entrega (Fatia 1+2) MOBILE FIRST LUXUOSA

Fundação técnica + design system + sessão de questões com pedagogia + checkpoint + SRS SM-2 versionado + modo Revisão de Erros. Sem simulados, sem dashboard analítico ainda. Sem conteúdo fictício.

Stack: TanStack Start + Lovable Cloud (Supabase) + Tailwind v4. Rotas em `src/routes/`.

## 1. Backend (Lovable Cloud) — uma migration

### Tabelas

- `**exam_editions**` — id, slug, nome, ano, banca, config jsonb (nº questões, pesos, nota mínima), fonte oficial (URL).
- `**positions**` — id, edition_id, código, nome, cargo (`analista|auditor|tecnico`), especialidade, exam_date, config jsonb (override opcional).
- `**syllabus_nodes**` — id, edition_id, parent_id, código, título, `exam_block` (`gerais|especificos`), ordem.
- `**questions**` — id, `question_type` (`multipla_escolha_5|certo_errado|discursiva`), `exam_format` (`objetiva|discursiva`), `exam_block` (`gerais|especificos`), `question_weight` numeric, statement, alternatives jsonb, correct_key text, explanation, distractor_rationales jsonb, `source_reference` jsonb (banca, ano, prova, url oficial), `review_status` (`draft|in_review|approved|published|retired`), created_by, published_at. CHECK: `question_type='multipla_escolha_5'` ⇒ alternatives tem exatamente 5.
- `**question_syllabus_matches**` — question_id, syllabus_node_id, weight.
- `**question_position_matches**` — question_id, position_id, aderencia numeric, edital_ref text.
- `**question_relationships**` — origem_id, destino_id, kind (`similar|prerequisite|variation|source_of_confusion`), created_by. Global, editorial. **Sem user_id, sem RLS de usuário**; apenas leitura pública, escrita restrita a admins.
- `**question_attempts**` — id, `client_attempt_id` UNIQUE por (user_id, client_attempt_id), user_id, question_id, session_id, mode, selected_key, is_correct, response_time_ms, confidence smallint nullable, error_type text nullable, algo_version text, created_at. **Imutável**: trigger BEFORE UPDATE/DELETE que RAISE EXCEPTION.
- `**srs_states**` — user_id + question_id PK, easiness numeric, interval_days int, repetitions int, due_at timestamptz, last_grade smallint, algo_version text, updated_at.
- `**study_sessions**` — id, user_id, mode, position_id nullable, started_at, ended_at, question_count, correct_count.
- `**study_profile_checkins**` — id, user_id, session_id, question_index (5,10,15…), kind, payload jsonb, created_at.
- `**review_recommendations**` — id, user_id, source_attempt_id, target_question_id, reason text, priority smallint, consumed_at nullable, created_at. **Privado, com user_id + RLS `auth.uid() = user_id`.**
- `**user_preferences**` — user_id PK, font_scale, high_contrast bool, reduce_motion bool, tts_enabled bool, preferred_position_id nullable.
- `**user_roles**` — padrão Lovable, com `has_role()` security definer. Enum `app_role`: `admin|curator|user`.

### RLS e GRANTs

- Leitura pública/authenticated (SELECT anon+authenticated): `exam_editions`, `positions`, `syllabus_nodes`, `question_syllabus_matches`, `question_position_matches`, `question_relationships`, e `questions WHERE review_status='published'`.
- RLS `auth.uid() = user_id`: `question_attempts` (INSERT+SELECT próprios; UPDATE/DELETE bloqueado por trigger), `srs_states`, `study_sessions`, `study_profile_checkins`, `review_recommendations`, `user_preferences`.
- Curadoria (INSERT/UPDATE em `questions`, `question_relationships`, matches): apenas `has_role(auth.uid(), 'curator')` ou `admin`.
- GRANTs explícitos por tabela (padrão Lovable).

### Seed (somente estrutura + edição/cargos — **zero questões**)

Uma edição: `TCE-MA 2026`, banca Cebraspe, URL oficial do edital, config `{alternativas: 5, gerais: 40, especificos: 60, peso_especificos: 2, total_pontos: 160, nota_minima: 64}`.

**16 especialidades**:

- **Analista Estadual de Apoio ao Controle Externo (10)** — exam_date 2026-11-22 — especialidades conforme edital oficial. Como o texto exato de cada uma das 10 especialidades deve vir do PDF do Cebraspe e o spec proíbe inventar, a migration cria os 10 slots com `code` numerado (`analista-01`…`analista-10`) e `nome` marcado `A confirmar via edital oficial`. Uma segunda migration curta preenche os nomes reais depois que forem confirmados. Alternativa: eu extraio agora do PDF do Cebraspe via `fetch_website` — se preferir, faço isso na execução e uso os nomes exatos.
- **Auditor Estadual de Controle Externo (5)** — exam_date 2026-11-29 — mesmo tratamento (`auditor-01`…`auditor-05`).
- **Técnico Estadual de Controle Externo (1)** — exam_date 2026-11-29 — nome definitivo.

Nenhuma `question` inserida. App opera em estado vazio honesto até curadoria publicar conteúdo autorizado.

## 2. `submitAttempt` transacional e idempotente

Implementado como **RPC PL/pgSQL** `submit_attempt(...)` chamada pelo server function `submitAttempt` (com `requireSupabaseAuth`).

Assinatura RPC: `(p_client_attempt_id uuid, p_question_id uuid, p_session_id uuid, p_mode text, p_selected_key text, p_response_time_ms int, p_confidence smallint, p_algo_version text)`.

Comportamento:

1. `BEGIN` implícito da função.
2. `INSERT INTO question_attempts (...) ON CONFLICT (user_id, client_attempt_id) DO NOTHING RETURNING *`.
3. Se conflito (retorno vazio): `SELECT` a tentativa existente e retorna ela — idempotente. Não atualiza SRS de novo.
4. Se inseriu: calcula `is_correct` no server (lookup `questions.correct_key`), roda SM-2 sobre `srs_states` (UPSERT com nova versão), grava `review_recommendations` se erro (link para questões similares via `question_relationships`).
5. Qualquer erro → função inteira em rollback automático (função PL/pgSQL é atômica).
6. Trigger em `question_attempts` impede UPDATE/DELETE (`RAISE EXCEPTION 'attempt is immutable'`).
7. `client_attempt_id` gerado no client (`crypto.randomUUID()`) ao renderizar a questão. Duplo clique reenvia o mesmo id → segundo INSERT no-op.

Server function `submitAttempt` retorna `{ attempt, correct_key, explanation, next_review_at, recommendations[] }`.

## 3. SM-2 versionado

Módulo puro `src/lib/srs.ts` — função pura testável.

- Entrada: estado atual + `grade` (0–5).
- Saída: novo estado com `algo_version = "sm2.v1"`.
- Chamado dentro do RPC (via extensão plv8? não — mantém no server function, na verdade). **Ajuste:** o SM-2 roda no server function TypeScript entre steps 2 e 4 acima, dentro de uma **única RPC** que aceita o estado calculado, OU o SM-2 é reimplementado em SQL. **Decisão:** para manter atomicidade real, o SM-2 vai como função SQL `srs_sm2_next(...)` também versionada. O `src/lib/srs.ts` fica como espelho puramente para testes de unidade e documentação; o RPC usa a versão SQL.

## 4. Rotas e fluxo sem perfil obrigatório

```
src/routes/
  __root.tsx          (fontes IBM Plex + Source Sans 3, meta pt-BR, skip-link)
  index.tsx           (landing curta: "Entrar" / "Criar conta")
  auth.tsx            (email+senha, sem coleta de cargo/nível/preferências)
  _authenticated/
    route.tsx         (managed)
    treino.tsx        (rota padrão pós-login — DIRETO em Treino Geral)
    revisao.tsx       (fila SRS vencida + erros recentes)
    preferencias.tsx  (a11y + cargo preferido — opcional, nunca bloqueia)
```

Regra: **após signup/login, redirect direto para `/treino**` em modo `geral`, sem cargo, sem diagnóstico. Os 3 CTAs (Treino geral / Escolher cargo / Diagnóstico rápido) ficam como chips no topo de `/treino` — o modo `geral` já está ativo, os outros são upgrades opcionais.

Checkpoint aparece **somente após a 5ª questão concluída** (contador por `study_session`), como Dialog do shadcn (focus trap Radix). Botões: Responder / Pular / Fechar. ESC fecha. Não bloqueia a próxima questão em nenhum caminho.

## 5. Design system (petróleo + dourado)

- `src/styles.css`: tokens oklch para petróleo profundo, cinza metálico (3 níveis de superfície), dourado sóbrio de acento, correct/incorrect com ícone além de cor.
- Fontes: IBM Plex Sans (títulos) + Source Sans 3 (corpo) via `<link>` no `__root.tsx`.
- Variantes shadcn: `Button` (`gold`, `ghost-gold`), `Card` (`glass` sutil).
- Foco visível global (ring dourado 2px). `prefers-reduced-motion` respeitado.

## 6. Server functions

Em `src/lib/`:

- `questions.functions.ts` — `getNextQuestion({ mode, positionId? })`, `getQuestionById`.
- `attempts.functions.ts` — `submitAttempt` (chama RPC `submit_attempt`).
- `sessions.functions.ts` — `startSession`, `endSession`.
- `checkpoints.functions.ts` — `recordCheckin`.
- `preferences.functions.ts` — `getPrefs`, `updatePrefs`.
- `reviews.functions.ts` — `getReviewQueue`.
- `editions.functions.ts` — público via server publishable client.

Seleção adaptativa v1: SRS vencido > erros recentes > tópicos pouco vistos > aleatório estratificado. Filtra por `preferred_position_id` quando definido.

## 7. Acessibilidade

- `lang="pt-BR"`, skip-link, foco visível.
- `aria-live="polite"` no feedback de resposta.
- Alternativas navegáveis por 1–5 e setas + Enter.
- Checkpoint operável 100% por teclado (ESC fecha, Tab circula, foco retorna à questão).
- Preferências aplicam classes no `<html>`: `.a11y-hc`, `.a11y-reduce-motion`, `--font-scale`.

## 8. Testes reais executados ao final (Playwright headless local)

1. Signup + login (usuário de teste).
2. RLS: tentativa direta em `question_attempts` de outro user_id retorna vazio/erro.
3. Fluxo de resposta end-to-end (com uma questão inserida manualmente via SQL de teste, revertida ao final).
4. Feedback renderiza com `aria-live`.
5. Persistência da tentativa e do `srs_states`.
6. Idempotência: duplo clique gera 1 linha em `question_attempts`.
7. Checkpoint aparece após a 5ª resposta.
8. Checkpoint fecha com ESC e por Tab→Fechar+Enter, foco volta.
9. Preferências: toggle high_contrast persiste e aplica classe.

Capturas salvas em `/tmp/browser/` para verificação.

## 9. Fora do escopo (registrado)

Simulados, dashboard analítico completo, redações, discursivas, correção IA, gamificação, ranking, marketplace, chat IA. Nenhum placeholder.

## 10. Decisão pendente sobre nomes das 16 especialidades

Escolho a opção A.

Extraia os nomes exatos das 16 especialidades diretamente do edital oficial do Cebraspe e grave-os na migration:

Analista:

1. Administração

2. Contabilidade

3. Direito

4. Engenharia de Telecomunicações

5. Engenharia Elétrica

6. Engenharia Mecânica

7. Estatística

8. Medicina

9. Psicologia

10. Tecnologia da Informação

Auditor:

11. Ciências Atuariais

12. Controle Externo

13. Engenharia

14. Medicina

15. Tecnologia da Informação

Técnico:

16. Técnico-Administrativa

Não crie slots “A confirmar”. Use o texto oficial do edital na coluna de especialidade e preserve o código do cargo correspondente.

Antes de executar a migration, valide que existem exatamente 16 posições, com as datas:

- Analista: 2026-11-22

- Auditor: 2026-11-29

- Técnico: 2026-11-29  
Faça do SM-2 em SQL a implementação canônica usada pelo RPC transacional. O arquivo src/lib/srs.ts deve ter testes de conformidade contra a função SQL, usando os mesmos casos de entrada e saída. Não mantenha duas implementações independentes sem teste de equivalência.

Padronize o nome do campo como algorithm_version em todas as tabelas, funções e respostas da API. Não use algo_version em alguns lugares e algorithm_version em outros.