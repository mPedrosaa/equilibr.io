# Backend e autenticação

O equilibr.io é uma aplicação estática. A estrutura de backend preparada neste
repositório usa **Supabase** para autenticação, catálogo de unidades curriculares
e, numa fase seguinte, persistência dos registos diários.

## Variáveis de ambiente

Copiar o exemplo:

```bash
cp .env.example .env
```

| Variável | Onde é usada | Pode ser pública? |
| --- | --- | --- |
| `SUPABASE_URL` | Frontend, scripts | Sim |
| `SUPABASE_ANON_KEY` | Frontend, scripts públicos | Sim, desde que o RLS esteja ativo |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas scripts administrativos e seed | **Não** |
| `SUPABASE_ACCESS_TOKEN` | Aplicar migrations via Management API (`sbp_...`) | **Não** |

A `SUPABASE_SERVICE_ROLE_KEY` ignora o Row Level Security. Nunca deve ser
colocada em `assets/js/config.js`, em HTML, em commits ou em variáveis expostas
ao browser. O `SUPABASE_ACCESS_TOKEN` é um token pessoal da Management API
(`sbp_...`) e também nunca deve ir para o frontend.

Depois de configurar o `.env`:

```bash
npm run config
```

Este comando gera `assets/js/config.js` com a URL e a anon key. O ficheiro de
configuração é público por desenho; a proteção dos dados depende das políticas
RLS definidas na base de dados.

## Criar a base de dados

1. Criar um projeto em [supabase.com](https://supabase.com).
2. Abrir o **SQL Editor**.
3. Executar o conteúdo de
   [`supabase/migrations/202611130001_init.sql`](../supabase/migrations/202611130001_init.sql).
4. Preencher `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
   no `.env`.
5. Aplicar as migrations:

```bash
npm run db:migrate
```

6. Executar o seed do catálogo:

```bash
npm run db:seed
```

Ou ambos de uma vez:

```bash
npm run db:setup
```

### Deploy estático (Vercel)

O repositório inclui um `vercel.json` que executa `npm run build` e publica a
pasta `dist/`. O build copia os ficheiros públicos e gera `assets/js/config.js`
a partir das variáveis de ambiente, sem alterar o ficheiro versionado.

Basta definir na Vercel:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Também são aceites os nomes usados por integrações comuns:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY` e
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

A `SUPABASE_SERVICE_ROLE_KEY` não deve ser adicionada ao projeto da Vercel.

## Modelo de dados

| Tabela | Objetivo |
| --- | --- |
| `profiles` | Dados do estudante: nome, curso, ano, semestre e metas semanais |
| `courses` | Catálogo de UCs e UCs personalizadas (`owner_id`) com ECTS, contacto, cor e semestre |
| `user_courses` | Inscrição de cada utilizador nas UCs |
| `activity_logs` | Registos diários de aula, estudo, projeto e descanso |
| `class_sessions` | Aulas semanais por UC, dia e intervalo |
| `study_blocks` | Blocos de estudo autónomo por dia e intervalo |
| `assessments` | Testes, avaliações e exames, com nota esperada, confiança (0–10) e nota recebida |

O perfil é criado automaticamente por um trigger em `auth.users`.

### Segurança

- RLS ativo em todas as tabelas.
- Cada utilizador só lê e altera o próprio perfil, inscrições e registos.
- O catálogo de UCs ativas é de leitura pública.
- O seed usa a service role key e deve ser executado apenas em ambiente
  controlado.

## Seed das UCs

O script [`scripts/seed-courses.mjs`](../scripts/seed-courses.mjs) lê as UCs de
`assets/js/data.js` e faz upsert em `public.courses`.

O catálogo atual é:

| Código | Unidade curricular | ECTS | Contacto |
| --- | --- | ---: | ---: |
| ALGAN | Álgebra Linear e Geometria Analítica | 5 | 3 h |
| APROG | Algoritmia e Programação | 6 | 4 h |
| AMATA | Análise Matemática | 5 | 3 h |
| LAPR1 | Laboratório/Projeto 1 | 8 | 5 h |
| PRCMP | Princípios da Computação | 6 | 4 h |

Executar:

```bash
npm run db:seed
```

## Estado atual da integração

- A landing page, o login, o registo e o perfil já estão preparados para Supabase Auth.
- A aplicação lê a sessão e substitui o perfil demo pelo nome e email do utilizador autenticado.
- O perfil permite atualizar nome, email e palavra-passe.
- O registo usa `signUp`, guarda o nome em `user_metadata.full_name` e redireciona a confirmação para `login.html`.
- Com sessão iniciada, o registo diário da aplicação começa vazio e usa `activity_logs`.
- O semestre e as UCs selecionadas são guardados em `profiles` e `user_courses`.
- `schedule.html` guarda aulas em `class_sessions` e estudo em `study_blocks`.
- `assessments.html` guarda avaliações em `assessments`; a nota esperada usa intervalos realistas (0–5, 5–7, 7–9, 9–11, 11–14, 14–16, 16–18, 18–20), a confiança um slider nativo de 0 a 10 e a nota recebida fica em `received_grade`.
- Com confirmação de email ativa, o utilizador tem de confirmar a conta antes de entrar. Configura o SMTP e as URLs permitidas no dashboard do Supabase.
- Sem `SUPABASE_URL` e `SUPABASE_ANON_KEY`, o login mostra um aviso e a aplicação
  continua disponível em modo de demonstração local.
- A aplicação (`app.html`) usa `localStorage` apenas em modo de demonstração.
- Com sessão Supabase, o registo diário é lido e escrito em `activity_logs`.
- O semestre, o horário e as avaliações já têm páginas e tabelas próprias; os
  cálculos sobre estes dados ficam para a fase seguinte.

## Próximos passos

1. Criar o fluxo de recuperação de password.
2. Migrar os cenários demo para dados remotos.
3. Usar o horário e as avaliações nos cálculos de carga e risco.
4. Adicionar testes de integração autenticados com um utilizador de teste.
5. Proteger `app.html` com verificação de sessão.
