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

Como o frontend é servido como site estático, `assets/js/config.js` tem de ser
gerado durante o build. No painel da Vercel:

1. Definir `SUPABASE_URL` e `SUPABASE_ANON_KEY` nas variáveis de ambiente.
2. Configurar o **Build Command** como `npm run config`.
3. Configurar o **Output Directory** como `.`.

A `SUPABASE_SERVICE_ROLE_KEY` não deve ser adicionada ao projeto da Vercel.

## Modelo de dados

| Tabela | Objetivo |
| --- | --- |
| `profiles` | Dados do estudante: nome, curso, ano, semestre e metas semanais |
| `courses` | Catálogo de UCs com ECTS, horas de contacto, cor e semestre |
| `user_courses` | Inscrição de cada utilizador nas UCs |
| `activity_logs` | Registos diários de aula, estudo, projeto e descanso |

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
- Com confirmação de email ativa, o utilizador tem de confirmar a conta antes de entrar. Configura o SMTP e as URLs permitidas no dashboard do Supabase.
- Sem `SUPABASE_URL` e `SUPABASE_ANON_KEY`, o login mostra um aviso e a aplicação
  continua disponível em modo de demonstração local.
- A aplicação (`app.html`) ainda usa `localStorage` para os dados de
  demonstração. A migração do estado para `activity_logs` é o passo seguinte.
- O catálogo e o esquema já estão prontos para essa migração.

## Próximos passos

1. Criar o fluxo de recuperação de password e confirmação de email.
2. Substituir o estado demo por chamadas ao Supabase.
3. Criar as inscrições do utilizador no primeiro login.
4. Adicionar logout e proteção de rota em `app.html`.
5. Cobrir os fluxos de autenticação com testes de integração.
