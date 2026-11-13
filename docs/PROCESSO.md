# Processo de desenvolvimento

**Equilibra** (ISEP Study-Life Balance Tracker) · protótipo web
LAPR1 2026/27 · turma LAPR1-2627-DKL01-Skills · grupo “Quarteto Maravilha”
Documento de processo · 2 de novembro de 2026

[← Voltar ao README](../README.md)

---

## 1. Resumo

Este documento descreve como o relatório do Sprint 1 foi transformado num protótipo web navegável, quais foram as decisões de âmbito e de arquitetura, como o modelo de dados e as regras de cálculo foram definidos, o que foi implementado e que evidências de qualidade foram recolhidas.

O resultado é uma aplicação estática em HTML5, Bootstrap 5.3.3 e JavaScript vanilla, com cinco vistas, persistência local no browser e dados de demonstração. Não existe backend nesta iteração.

### Resultado em números

| Indicador | Resultado |
| --- | ---: |
| Vistas principais | 5 |
| Módulos funcionais do relatório cobertos | 3 de 3 |
| UCs de demonstração | 5 |
| Registos de demonstração | 29 |
| Cenários de teste | 4 (base, equilibrado, sobrecarga e recuperação) |
| Testes de domínio | 13 aprovados |
| Verificações funcionais no browser | 30 aprovadas |
| Erros JavaScript observados na sessão de QA | 0 |

### Entregáveis

- `index.html` — interface completa.
- `assets/css/styles.css` — design system e responsividade.
- `assets/js/core.js` — regras de negócio puras.
- `assets/js/data.js` — UCs, dados demo e cenários.
- `assets/js/app.js` — estado, rotas e interface.
- `tests/core.test.js` — testes de domínio.
- `README.md` — visão geral e instruções.
- `docs/PROCESSO.md` — este documento.
- `docs/screenshots/` — evidências visuais.

---

## 2. Fonte e contexto

### 2.1 Documento de origem

O ponto de partida foi o ficheiro `Relatório 1 - SPRINT 1 (1).pdf`, com data de 1 de novembro de 2026. O relatório apresenta:

- a contextualização do problema de sobrecarga e desregulação do esforço no 1.º ano de Engenharia Informática no ISEP;
- a análise de ferramentas genéricas (Google Calendar, Forest e Trello);
- a proposta de valor do produto;
- os três módulos funcionais;
- o alinhamento com o ODS 3 (Saúde e Bem-Estar);
- o contexto de metodologia Scrum e de utilização ética de IA.

O relatório é um documento de **Sprint 1** e descreve a visão e a arquitetura funcional, não um caderno de requisitos detalhado. Por esse motivo, os requisitos operacionais, os critérios de aceitação e as regras numéricas tiveram de ser derivados e explicitados neste documento.

### 2.2 Problema identificado

A passagem para o ensino superior aumenta a autonomia exigida ao estudante e concentra projetos, avaliações e trabalho autónomo. Sem um método de planeamento, o esforço pode oscilar entre períodos de subutilização e picos de sobrecarga. O relatório associa essa desregulação a ansiedade, privação de sono e risco de exaustão académica.

A oportunidade do produto está em tornar o esforço **visível, quantificável e preventivo**, em vez de depender apenas de uma agenda ou de uma lista de tarefas.

### 2.3 Público-alvo

O público primordial são estudantes do 1.º ano da Licenciatura em Engenharia Informática do ISEP. Para o protótipo, foi usado um perfil demonstrativo de um estudante com cinco UCs e 30 ECTS.

### 2.4 Três módulos do relatório

| Módulo | Promessa do relatório | Tradução para o protótipo |
| --- | --- | --- |
| Gestão de ECTS | Registar UCs e créditos e calcular metas de estudo autónomo | CRUD de UCs, fórmula ECTS e metas por UC |
| Registo diário | Registar horas por disciplina, aulas, estudo e projeto | Formulário, histórico, filtros e resumos |
| Anti-burnout | Analisar atividade recente, desvios de descanso e sobrecarga | Pontuação de 0–100, fatores, níveis e recomendações |

### 2.5 Âmbito original vs. protótipo

O relatório propõe uma **aplicação em consola**. O pedido desta iteração foi um protótipo **HTML + Bootstrap**, sem backend. Esta diferença é uma decisão de âmbito assumida, não uma omissão acidental.

**Justificação:** a interface web permite validar mais cedo a hierarquia da informação, os fluxos de registo e a legibilidade do risco. As regras de cálculo e o modelo de dados foram isolados em `core.js` e `data.js` para poderem ser reutilizados numa futura implementação em consola ou numa aplicação com backend.

**Consequência:** o protótipo não valida a ergonomia de uma CLI, nem substitui a implementação de consola prevista no relatório.

---

## 3. Requisitos

### 3.1 Método

Cada requisito foi derivado de uma passagem do relatório ou de uma necessidade direta de validação do protótipo. A prioridade usa uma adaptação de MoSCoW:

- **Must** — sem isto o fluxo principal não existe.
- **Should** — melhora a validação, mas não bloqueia o núcleo.
- **Could** — útil para uma iteração seguinte.

Os critérios de aceitação são verificáveis e foram escritos para o protótipo, uma vez que o relatório não os define de forma explícita.

### 3.2 Requisitos funcionais

| ID | Requisito | Origem | Prioridade | Estado |
| --- | --- | --- | --- | --- |
| RF01 | Registar UCs com nome, código, ECTS e horas de contacto | Relatório 3.2, módulo 1 | Must | Implementado |
| RF02 | Calcular a carga semanal e a meta autónoma por UC | Relatório 3.2, módulo 1 | Must | Implementado |
| RF03 | Criar, editar e eliminar UCs com validação | Derivação de RF01 | Must | Implementado |
| RF04 | Registar aulas, estudo autónomo, projeto e descanso | Relatório 3.2, módulo 2 | Must | Implementado |
| RF05 | Associar registos a UCs, exceto descanso | Relatório 3.2, módulo 2 | Must | Implementado |
| RF06 | Persistir UCs e registos no browser | Derivação de RF04 | Must | Implementado |
| RF07 | Mostrar histórico com filtros por período, UC e tipo | Derivação de RF04 | Should | Implementado |
| RF08 | Apresentar indicadores agregados dos últimos sete dias | Relatório 3.2, módulo 3 | Must | Implementado |
| RF09 | Calcular um risco de burnout de 0 a 100 com cinco fatores | Relatório 3.2, módulo 3 | Must | Implementado |
| RF10 | Explicar a pontuação e gerar recomendações | Relatório 2.3 e 3.2 | Must | Implementado |
| RF11 | Disponibilizar cenários de demonstração | Necessidade de QA e demonstração | Should | Implementado |
| RF12 | Repor os dados de demonstração | Necessidade de demonstração | Should | Implementado |
| RF13 | Adaptar a interface a desktop e mobile | Requisito desta iteração | Must | Implementado |
| RF14 | Apresentar o contexto, os limites e a equipa | Requisito desta iteração | Should | Implementado |

### 3.3 Requisitos não funcionais

| ID | Requisito | Decisão |
| --- | --- | --- |
| RNF01 | Sem backend nesta iteração | Estado e persistência apenas no browser |
| RNF02 | Executar sem build e sem CDN | HTML, CSS e JS estáticos; Bootstrap vendorizado |
| RNF03 | Domínio testável fora do browser | `core.js` sem dependências do DOM |
| RNF04 | Privacidade por omissão | Dados guardados localmente, sem envio para servidores |
| RNF05 | Interface em pt-PT | Textos, datas e formatação `Intl` em português |
| RNF06 | Feedback claro para ações destrutivas | Modais de confirmação e toasts |
| RNF07 | Acessibilidade básica | Landmarks, `aria-*`, foco visível e `prefers-reduced-motion` |
| RNF08 | Responsividade | Breakpoints Bootstrap e offcanvas em mobile |

### 3.4 Fora do âmbito desta iteração

- Backend, base de dados, autenticação e perfis reais.
- Sincronização entre dispositivos.
- Exportação de dados e importação de calendário.
- Notificações push, email ou lembretes.
- Aplicação de consola.
- Validação clínica do risco de burnout.
- Painel de administração, docentes ou instituição.
- Testes de carga, multiutilizador e segurança de servidor.

### 3.5 Critérios de aceitação globais

O protótipo é considerado aceite para demonstração quando:

1. As cinco vistas navegam sem recarregar a página e sem erros JavaScript.
2. Criar, editar e eliminar uma UC atualiza os totais e as metas.
3. Criar e eliminar um registo atualiza o histórico, os resumos e o dashboard.
4. Os dados sobrevivem a um refresh do browser.
5. O cenário de sobrecarga produz risco **Crítico** e o cenário equilibrado produz risco **Baixo**.
6. Repor a demo devolve o estado inicial (39/100, Moderado).
7. A navegação mobile abre e fecha o menu offcanvas e muda de vista.
8. Os 13 testes de domínio passam.

---

## 4. Personas e histórias de utilizador

### 4.1 Persona principal

**Estudante do 1.º ano de LEI no ISEP.** Tem várias UCs com projetos e avaliação contínua, precisa de distribuir o estudo autónomo e nem sempre consegue estimar se o ritmo recente é sustentável. Quer registar pouco e obter uma leitura rápida, sem manter uma folha de cálculo.

**Objetivos:** cumprir as metas sem colapsar, perceber se o descanso está a ser suficiente e antecipar semanas de sobrecarga.

**Frustrações:** planeamento manual, ferramentas genéricas que não conhecem ECTS, registos morosos e alertas tardios.

**Contexto de uso:** sessões curtas ao fim do dia, em desktop ou telemóvel.

### 4.2 Histórias de utilizador

| ID | História | Requisito | Validação |
| --- | --- | --- | --- |
| US01 | Como estudante, quero registar as minhas UCs e créditos para saber quanto devo estudar. | RF01–RF03 | QA de CRUD de UC |
| US02 | Como estudante, quero ver a meta semanal por UC para distribuir o esforço. | RF02 | Cartões de UC e testes de domínio |
| US03 | Como estudante, quero registar atividade em menos de um minuto. | RF04–RF05 | QA do formulário e durações rápidas |
| US04 | Como estudante, quero consultar e filtrar o meu histórico. | RF07 | QA de filtros e tabela |
| US05 | Como estudante, quero perceber se o meu ritmo é sustentável. | RF08–RF10 | Dashboard, gauge e cenários |
| US06 | Como estudante, quero receber sugestões concretas quando o risco sobe. | RF10 | Lista de recomendações |
| US07 | Como avaliador, quero testar rapidamente cenários extremos. | RF11 | Laboratório de cenários |
| US08 | Como avaliador, quero voltar ao estado inicial após uma demonstração. | RF12 | QA de reposição |
| US09 | Como utilizador mobile, quero navegar sem perder contexto. | RF13 | QA de offcanvas em viewport estreito |
| US10 | Como leitor do projeto, quero conhecer o âmbito e os limites. | RF14 | Vista “Sobre” e documentação |

---

## 5. Arquitetura da informação

### 5.1 Navegação

A aplicação tem cinco rotas de hash:

| Rota | Título na topbar | Conteúdo |
| --- | --- | --- |
| `#dashboard` | Visão geral | Risco, KPIs, gráfico, sinais, metas e registos recentes |
| `#ects` | Gestão de ECTS | Totais, fórmula, cartões e CRUD de UCs |
| `#registo` | Registo de atividade | Formulário, resumos, filtros e histórico |
| `#burnout` | Bem-estar | Gauge, radar, fatores, heatmap, recomendações e cenários |
| `#sobre` | Documentação | Contexto, estado dos dados, passos de teste e limites |

A rota desconhecida cai em `#dashboard`. A navegação usa `hashchange`, fecha o offcanvas em mobile e repõe o scroll no topo.

### 5.2 Shell da aplicação

```text
┌──────────────────────┬────────────────────────────────────────────┐
│ Sidebar              │ Topbar                                     │
│  marca               │  breadcrumb + título    data  ações  avatar│
│  curso / semestre    ├────────────────────────────────────────────┤
│  navegação           │                                            │
│  dica de protótipo   │  Conteúdo da vista                         │
│  perfil demo         │  painéis, cartões, tabelas e formulários   │
│                      │                                            │
│                      │  Footer                                    │
└──────────────────────┴────────────────────────────────────────────┘
```

Em ecrãs inferiores a `992px`, a sidebar passa a offcanvas e é aberta pelo botão de menu da topbar.

### 5.3 Fluxo principal

```text
1. Abrir a demo
      ↓
2. Consultar a visão geral (metas + risco)
      ↓
3. Ajustar UCs no módulo ECTS
      ↓
4. Registar atividade no registo diário
      ↓
5. Observar a atualização de KPIs, gráfico e risco
      ↓
6. Abrir anti-burnout, ler fatores e recomendações
      ↓
7. Testar cenário de sobrecarga ou repor a demo
```

### 5.4 Fluxo de cenário

```text
Anti-burnout
  → escolher cenário
  → modal de confirmação
  → substituir logs dos últimos 7 dias
  → manter UCs
  → recalcular métricas e risco
  → toast de confirmação
```

---

## 6. Design e sistema visual

### 6.1 Princípios

- **Legibilidade primeiro:** números grandes, rótulos curtos e hierarquia clara.
- **Cor com significado:** teal para estudo, verde para descanso, âmbar para atenção e vermelho para risco.
- **Densidade controlada:** cartões e painéis com espaçamento generoso, sem esconder ações principais.
- **Consistência:** um único padrão de painel, badge, botão, formulário e feedback.
- **Mobile sem perda de função:** a mesma informação, reorganizada em coluna.

### 6.2 Tokens principais

| Token | Valor | Uso |
| --- | --- | --- |
| `--navy` | `#0b1f3a` | Sidebar e hero |
| `--teal` | `#0f9d8a` | Ação primária e estudo |
| `--green` | `#16a34a` | Descanso e sucesso |
| `--amber` | `#f59e0b` | Atenção moderada |
| `--coral` | `#ef4444` | Risco e ações destrutivas |
| `--canvas` | `#f3f6fb` | Fundo da aplicação |
| `--surface` | `#ffffff` | Painéis e cartões |
| `--ink` | `#0f1f35` | Texto principal |
| `--muted` | `#64748b` | Texto secundário |
| `--radius` | `18px` | Cartões e painéis |
| `--shadow` | sombra suave | Elevação de superfícies |

A tipografia usa a pilha nativa do sistema (`system-ui`, Segoe UI, Roboto, etc.), sem dependência de fontes externas.

### 6.3 Componentes próprios

- `metric-card`, `stat-card`, `summary-card` — indicadores.
- `panel` — contentor base com cabeçalho e corpo.
- `hero-card` — destaque do dashboard.
- `gauge`, `heatmap`, `chart-wrap` — visualizações em CSS.
- `risk-badge`, `type-badge`, `badge-soft-*` — estados semânticos.
- `course-card`, `factor-item`, `habit-card`, `scenario-option` — módulos específicos.
- `toast` e `confirm-content` — feedback e confirmação.

### 6.4 Responsividade e acessibilidade

- Breakpoints Bootstrap em `576`, `768`, `992` e `1200` px, complementados por regras próprias.
- Sidebar fixa em desktop; offcanvas em mobile.
- Grelhas de KPIs passam de quatro para duas colunas em ecrãs pequenos.
- Tabelas usam `table-responsive`.
- `skip-link`, landmarks, `aria-label`, `aria-live` nos toasts e foco visível.
- Animações desativadas com `prefers-reduced-motion`.
- Formulários com `label`, mensagens de erro e validação nativa complementada por JS.

---

## 7. Modelo de dados

### 7.1 Persistência

O estado é um único objeto JSON guardado em `localStorage` com a chave:

```text
slbt.state.v1
```

Não há cookies, IndexedDB ou chamadas de rede. O estado é carregado no arranque, validado de forma tolerante e guardado após cada alteração.

### 7.2 Forma do estado

```json
{
  "version": 1,
  "settings": {
    "ectsHours": 27,
    "semesterWeeks": 20,
    "restWeeklyTargetHours": 14
  },
  "profile": {
    "name": "Nuno Sousa",
    "firstName": "Nuno",
    "initials": "NS",
    "degree": "LEI · 1.º ano",
    "semester": "2026/27 · 1.º semestre"
  },
  "courses": [
    {
      "id": "lapr1",
      "name": "Laboratório de Engenharia I",
      "code": "LAPR1",
      "ects": 6,
      "contactHours": 4,
      "color": "#0f9d8a"
    }
  ],
  "logs": [
    {
      "id": "demo-default-2026-11-02-a0",
      "date": "2026-11-02",
      "courseId": "lapr1",
      "type": "estudo",
      "minutes": 120,
      "note": "Afinar protótipo e relatório",
      "createdAt": "2026-11-02T17:30:00"
    }
  ],
  "meta": {
    "demo": true,
    "scenario": "default",
    "seededAt": "2026-11-02T15:19:00.000Z",
    "lastUpdated": "2026-11-02T15:19:00.000Z"
  }
}
```

### 7.3 Entidades e invariantes

| Entidade | Campos principais | Invariantes |
| --- | --- | --- |
| Curso/UC | `id`, `name`, `code`, `ects`, `contactHours`, `color` | Código único (case-insensitive); ECTS > 0; horas de contacto ≥ 0; cor hexadecimal |
| Registo | `id`, `date`, `courseId`, `type`, `minutes`, `note`, `createdAt` | Data ≤ hoje; 5 ≤ minutos ≤ 720; UC obrigatória exceto em `descanso` |
| Perfil | `name`, `firstName`, `initials`, `degree`, `semester` | Apenas demonstrativo; não editável |
| Configuração | `ectsHours`, `semesterWeeks`, `restWeeklyTargetHours` | Valores por omissão; sem UI de configuração nesta iteração |
| Metadados | `demo`, `scenario`, `seededAt`, `lastUpdated` | Usados na vista “Sobre” e na reposição |

### 7.4 Tipos de atividade

| Tipo | Etiqueta | Conta como estudo autónomo? | Requer UC? |
| --- | --- | --- | --- |
| `aula` | Aula | Não (conta para carga total) | Sim |
| `estudo` | Estudo autónomo | Sim | Sim |
| `projeto` | Projeto / reunião | Sim | Sim |
| `descanso` | Descanso / lazer | Não (conta para descanso) | Não |

**Trabalho académico** = `aula` + `estudo` + `projeto`.
**Estudo autónomo** = `estudo` + `projeto`.
**Descanso** = `descanso`.

### 7.5 Ciclo de vida do estado

1. **Arranque:** `loadState()` tenta ler a chave. Se não existir, cria o seed com `DATA.seedState(new Date())`.
2. **Validação:** confirma que `courses` e `logs` são arrays, aplica defaults em falta e descarta registos sem data, tipo ou minutos numéricos.
3. **Alteração:** cada operação atualiza o estado em memória e chama `saveState()`.
4. **Personalização:** criar/editar/eliminar UCs, adicionar/eliminar registos e aplicar cenários marcam `meta.scenario` como `custom` ou com o cenário aplicado.
5. **Reposição:** `resetDemo()` substitui o estado por um novo seed e volta a guardar.
6. **Falha de leitura:** se o JSON for inválido, o estado é reposto com um aviso na consola.

### 7.6 Dados de demonstração

O seed é **relativo à data de execução**. Os logs cobrem os últimos sete dias e incluem:

- aulas segundo um plano semanal fixo (segunda a sexta);
- estudo autónomo e projeto distribuídos pelos sete dias;
- descanso em seis dos sete dias;
- uma sequência de sete dias com estudo autónomo.

Esta escolha evita que a demo fique “presa” numa semana antiga e mantém os indicadores coerentes com a data mostrada.

---

## 8. Regras de negócio e fórmulas

### 8.1 Conversão ECTS

Constantes por omissão:

```text
1 ECTS = 27 horas de trabalho total
1 semestre = 20 semanas
meta de descanso = 14 horas por semana
```

Fórmulas:

```text
carga semanal da UC = (ECTS × 27) ÷ 20
meta autónoma da UC = max(0, carga semanal da UC − horas de contacto)
carga total semanal = soma das cargas semanais das UCs
meta autónoma global = soma das metas autónomas das UCs
carga semestral estimada = carga total semanal × 20
```

A carga semestral é derivável (30 ECTS × 27 h = 810 h), mas a interface privilegia a meta semanal. Não existe um cartão dedicado ao total semestral.

Exemplos:

| UC | ECTS | Contacto | Carga semanal | Meta autónoma |
| --- | ---: | ---: | ---: | ---: |
| Laboratório de Engenharia I | 6 | 4 h | 8,1 h | 4,1 h |
| Programação I | 6 | 4 h | 8,1 h | 4,1 h |
| Matemática Discreta | 6 | 3 h | 8,1 h | 5,1 h |
| Caso sem tempo autónomo | 3 | 10 h | 4,1 h | 0 h |

O arredondamento é feito a uma casa decimal apenas para apresentação e para os valores derivados usados na interface. O cálculo interno trabalha em minutos para as métricas de registo.

### 8.2 Janela móvel de sete dias

A janela é:

```text
[hoje − 6 dias, hoje]
```

Inclui o dia atual e os seis anteriores. Um registo fora deste intervalo não entra nos KPIs, no gráfico, no heatmap, na sequência nem no risco. A escolha é intencional:

- uma janela semanal fixa (segunda a domingo) faria o risco cair artificialmente à segunda-feira;
- uma janela móvel reflete melhor o esforço recente e é estável para demonstração em qualquer dia.

### 8.3 Métricas

Para os registos da janela:

```text
estudo autónomo = soma(estudo) + soma(projeto)
aulas = soma(aula)
trabalho académico = estudo autónomo + aulas
descanso = soma(descanso)
rácio de carga = estudo autónomo ÷ meta autónoma global
rácio de descanso = descanso ÷ meta de descanso
média diária = estudo autónomo ÷ 7
sessão mais longa = máximo de minutos entre estudo e projeto
```

A média diária usa sempre **7** no denominador, incluindo dias sem registo. Isto evita inflacionar a média em semanas com poucos dias ativos.

**Sequência de estudo:** conta dias consecutivos com pelo menos um registo de estudo ou projeto. Se hoje ainda não tiver registo, a contagem começa ontem. Isto evita que a sequência apareça como zero durante a manhã.

### 8.4 Motor de risco

A pontuação é a soma de cinco fatores independentes, limitada a 100:

```text
score = clamp(streak + load + rest + average + longest, 0, 100)
```

#### Fator 1 — Dias consecutivos de estudo (máx. 30)

| Condição | Pontos |
| --- | ---: |
| ≥ 10 dias | 30 |
| 7 a 9 dias | 22 |
| 5 a 6 dias | 12 |
| 3 a 4 dias | 4 |
| 0 a 2 dias | 0 |

#### Fator 2 — Carga face à meta semanal (máx. 30)

| Rácio | Pontos |
| --- | ---: |
| ≥ 150% | 30 |
| 125% a 149% | 20 |
| 110% a 124% | 10 |
| < 110% | 0 |

#### Fator 3 — Descanso registado (máx. 20)

| Descanso face à meta | Pontos |
| --- | ---: |
| < 25% | 20 |
| 25% a 49% | 12 |
| 50% a 74% | 6 |
| ≥ 75% | 0 |

#### Fator 4 — Média diária de estudo autónomo (máx. 15)

| Média | Pontos |
| --- | ---: |
| ≥ 7 h/dia | 15 |
| 5 a 6,9 h/dia | 8 |
| < 5 h/dia | 0 |

#### Fator 5 — Sessão mais longa (máx. 10)

| Duração | Pontos |
| --- | ---: |
| ≥ 4 h | 10 |
| 3 a 3,9 h | 5 |
| < 3 h | 0 |

### 8.5 Níveis e comunicação

| Score | Nível | Mensagem base |
| ---: | --- | --- |
| 0–24 | Baixo | Ritmo sustentável. Mantém as pausas e o descanso. |
| 25–49 | Moderado | Há sinais de desgaste acumulado. Vale a pena abrandar nas próximas 48 horas. |
| 50–74 | Elevado | A carga está acima do sustentável. Reduz o ritmo e protege o descanso. |
| 75–100 | Crítico | Sinal de alerta elevado. Faz uma pausa real e procura apoio se este padrão continuar. |

O texto de **Crítico** inclui um encaminhamento para apoio, e a vista de bem-estar inclui um aviso permanente de que o indicador não é clínico.

### 8.6 Recomendações

As recomendações são geradas a partir dos fatores com pontuação positiva:

| Fator | Recomendação |
| --- | --- |
| Sequência | Agendar um dia sem estudo autónomo nas próximas 48 horas |
| Descanso | Proteger pelo menos 2 horas por dia de descanso longe de ecrãs |
| Carga | Reduzir a carga da próxima semana em pelo menos 20% |
| Média diária | Limitar o estudo a 5 h/dia e pausar 10 minutos a cada 90 |
| Sessão longa | Dividir sessões em blocos de 90 minutos com pausas reais |

Se nenhum fator tiver pontos, são mostradas recomendações de manutenção. A lista é limitada a quatro itens.

### 8.7 Calibração dos cenários

| Cenário | Streak | Carga | Descanso | Média | Sessão | Score | Nível |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Base | 22 | 0 | 12 | 0 | 5 | 39 | Moderado |
| Equilibrado | 12 | 0 | 0 | 0 | 0 | 12 | Baixo |
| Sobrecarga | 22 | 30 | 20 | 8 | 10 | 90 | Crítico |
| Recuperação | 0 | 0 | 0 | 0 | 0 | 0 | Baixo |

Os pesos e limites são **hipóteses de design** para validar a interação. Não foram derivados de um estudo clínico nem validados por profissionais de saúde. Uma versão de produção teria de rever esta calibração com literatura e acompanhamento especializado.

---

## 9. Implementação

### 9.1 Cronologia de trabalho

A ordem abaixo reflecte a sequência efetiva de construção, sem tempos estimados.

| Etapa | Trabalho realizado | Artefactos |
| --- | --- | --- |
| 1. Análise | Leitura do PDF, extração dos módulos, objetivos e condicionantes | Notas de requisitos |
| 2. Âmbito | Decisão de adaptar a consola a um protótipo web, sem backend | Secção 2.5 |
| 3. Domínio | Fórmulas ECTS, janela móvel, métricas, risco e recomendações | `core.js` |
| 4. Dados | UCs mock, plano de aulas, seed relativo e três cenários | `data.js` |
| 5. Testes de domínio | Casos de datas, metas, cenários e limites | `tests/core.test.js` |
| 6. Interface | Shell, sidebar, topbar, cinco vistas, modais e toasts | `index.html` |
| 7. Design | Tokens, componentes, gráficos CSS e breakpoints | `styles.css` |
| 8. Ligação | Rotas, estado, localStorage, CRUD, filtros e renderização | `app.js` |
| 9. QA | Testes de domínio, suite Selenium e revisão visual | Resultados e capturas |
| 10. Documentação | README, processo, rastreabilidade e screenshots | `README.md`, `docs/` |

### 9.2 Separação de responsabilidades

**`core.js`**

- Não acede ao DOM, ao Bootstrap ou ao `localStorage`.
- Exporta funções puras através de UMD: `window.SLTCore` no browser e `module.exports` em Node.
- Calcula datas, metas, métricas, risco e recomendações.
- É a fonte única das regras numéricas.

**`data.js`**

- Depende de `core.js` para gerar datas.
- Define as cinco UCs ilustrativas, o plano de aulas, os padrões diários e os cenários.
- Gera o estado inicial com IDs determinísticos por cenário e data.

**`app.js`**

- Lê e valida o estado guardado.
- Implementa as rotas de hash.
- Renderiza todas as vistas a partir do estado.
- Gere CRUD, filtros, modais, toasts e reposição.
- Escapa texto interpolado em HTML com `esc()` para evitar injeção de markup.

**`styles.css`**

- Define os tokens, componentes, estados e animações.
- Constrói os gráficos com barras, gradientes e `conic-gradient`.
- Aplica breakpoints e `prefers-reduced-motion`.

### 9.3 Decisões de implementação

| Decisão | Alternativa considerada | Razão |
| --- | --- | --- |
| JavaScript vanilla | React/Vue | Sem build, menos peso e mais transparência para um protótipo académico |
| Hash routing | History API | Funciona em qualquer servidor estático sem rewrites |
| localStorage | IndexedDB | Simplicidade suficiente para um único utilizador e dados pequenos |
| Seed relativo à data | Dataset fixo | A demo mantém-se coerente em qualquer dia |
| Gráficos em CSS | Chart.js | Menos dependências e controlo visual total |
| Domínio separado | Regras dentro de `app.js` | Testabilidade e reutilização |
| Cenários substituem logs | Cenários adicionam logs | Evita contaminar a demo e permite comparar extremos |
| Bootstrap vendorizado | CDN | Execução offline e comportamento previsível |

### 9.4 Validações implementadas

**UC**

- Nome e código obrigatórios; código convertido para maiúsculas.
- Código único, comparado sem distinção de maiúsculas.
- ECTS positivo; horas de contacto não negativas.
- Limites HTML: nome 80 caracteres, código 12, ECTS 1–30, contacto 0–30.
- Eliminar uma UC remove os registos associados e limpa o filtro ativo.

**Registo**

- Data obrigatória e não futura.
- Tipo obrigatório.
- UC obrigatória para aula, estudo e projeto.
- Duração entre 5 e 720 minutos, com passos de 5.
- Nota opcional até 120 caracteres.
- O formulário repõe a data de hoje após submissão.
- Descanso não pede UC e aparece como “Bem-estar” no histórico.

**Estado**

- JSON inválido ou estruturas em falta originam reposição da demo.
- O toast de erro de gravação cobre quota cheia ou armazenamento bloqueado.
- Operações destrutivas exigem confirmação num modal comum.

---

## 10. Qualidade e evidências

### 10.1 Testes de domínio

Comando:

```bash
node tests/core.test.js
```

Resultado: **13/13 aprovados**.

| # | Teste | O que verifica |
| ---: | --- | --- |
| 1 | `dateKey` e `lastNDays` | Datas locais e janela terminada hoje |
| 2 | Conversão ECTS | 6 ECTS + 4 h = 8,1 h totais e 4,1 h autónomas |
| 3 | Metas do seed | 30 ECTS, 18 h de contacto, 22,5 h e 40,5 h |
| 4 | Indicadores do seed | 21 h autónomas, 6,5 h de descanso, 7 dias, sessão de 3 h |
| 5 | Soma por UC | Metas e registos por UC somam os totais globais |
| 6 | Risco base | 39/100, moderado, streak 22 e descanso 12 |
| 7 | Sobrecarga | 90/100, crítico, com recomendações |
| 8 | Equilibrado e recuperação | Ambos em risco baixo; recuperação com 0 |
| 9 | Fora da janela | Um registo antigo não altera as métricas |
| 10 | Sequência sem estudo hoje | A contagem começa ontem |
| 11 | Limite superior | Pontuação máxima fica em 100 |
| 12 | Meta zero | UC com contacto superior à carga total tem meta 0 |
| 13 | Rácios dos cenários | Todos os rácios são não negativos |

### 10.2 QA funcional

Foi executada uma suite Selenium em Firefox headless, com janela desktop de 1440 × 1200 px e uma redução posterior para 390 × 844 px. O Firefox headless aplicou um viewport efetivo de 1440 × 1114 px em desktop e 500 × 758 px em mobile; os testes de layout mobile correram, portanto, abaixo do breakpoint de 576 px.

Resultado: **30/30 verificações aprovadas, 0 erros JavaScript**.

| Grupo | Verificações | Evidência |
| --- | ---: | --- |
| Dashboard | 5 | 21,0 h, 6,5 h, 7 dias, risco moderado, 7 colunas no gráfico |
| CRUD de UCs | 9 | Criar, persistir, editar, recalcular meta, eliminar e repor totais |
| Registo diário | 4 | Contagem inicial, criação, persistência e eliminação |
| Cenários | 5 | Sobrecarga 90/Crítico, equilíbrio 12/Baixo, reposição 39/Moderado |
| Persistência | 2 | 5 UCs e 29 registos após refresh |
| Validação | 1 | Formulário vazio mostra erro |
| Mobile | 3 | Botão de menu, abertura do offcanvas e navegação |
| Erros JS | 1 | Nenhum erro por sessão |

A suite foi usada como ferramenta de QA do ambiente de desenvolvimento e não está incluída no repositório. Os testes de domínio em `tests/core.test.js` são os únicos que podem ser executados apenas com Node.js.

### 10.3 Revisão visual

Foram capturadas as cinco vistas em desktop e duas vistas representativas em mobile:

| Captura | Dimensão | Ficheiro |
| --- | --- | --- |
| Visão geral | 1440 × 1114 | `screenshots/dashboard.png` |
| Gestão de ECTS | 1440 × 1114 | `screenshots/ects.png` |
| Registo diário | 1440 × 1114 | `screenshots/registo.png` |
| Anti-burnout | 1440 × 1114 | `screenshots/burnout.png` |
| Sobre | 1440 × 1114 | `screenshots/sobre.png` |
| Visão geral mobile | 500 × 758 | `screenshots/mobile-dashboard.png` |
| Anti-burnout mobile | 500 × 758 | `screenshots/mobile-burnout.png` |

As dimensões correspondem aos ficheiros finais. O Firefox headless impõe uma largura mínima de 500 px, pelo que a captura mobile usa 500 px, ainda abaixo do breakpoint de 576 px.

A revisão visual confirmou que:

- os KPIs passam de quatro para duas colunas em mobile;
- o hero e o gauge não provocam overflow horizontal;
- a sidebar desaparece e o botão de menu assume a navegação;
- a tabela de registos permanece utilizável com scroll horizontal;
- os estados de risco usam cor, texto e ícone, não apenas cor.

### 10.4 Limites da validação

- Não foi feito um teste formal de acessibilidade com leitor de ecrã ou auditoria WCAG completa.
- Não foram testados Safari, Edge ou browsers móveis reais.
- Não existem testes end-to-end versionados no repositório.
- A suite Selenium não corre em CI.
- A calibração do risco não foi validada clinicamente.

---

## 11. Rastreabilidade relatório → protótipo

| Referência no relatório | Promessa ou requisito | Implementação | Evidência |
| --- | --- | --- | --- |
| 1.2, objetivos específicos | Automatizar a carga semanal e semestral com ECTS | Carga semanal no módulo ECTS; semestral derivável (×20), sem cartão dedicado | Testes 2–5; vista `#ects` |
| 1.2, objetivos específicos | Registo diário persistente por UC | Formulário, histórico e localStorage | QA de registo; vista `#registo` |
| 1.2, objetivos específicos | Monitorização proativa de fadiga | Motor de cinco fatores e níveis | Testes 6–8; vista `#burnout` |
| 2.3, pilar 1 | Cálculo automático por ECTS | Meta total e meta autónoma por UC | Cartões de UC e fórmula visível |
| 2.3, pilar 2 | Algoritmo anti-burnout proativo | Score, fatores, sinais e recomendações | Gauge, radar e decomposição |
| 2.3, pilar 3 | Foco académico específico do ISEP | UCs e perfil demonstrativos de LEI | Seed e vista “Sobre” |
| 2.3, pilar 4 | Interface em consola otimizada | **Adaptada** para web nesta iteração | Secção 2.5 e limitações |
| 3.1 | Transformar planeamento reativo em preventivo | Dashboard com metas e risco | `#dashboard` |
| 3.2, módulo 1 | Gestão de ECTS | CRUD, totais e fórmula | QA de UCs |
| 3.2, módulo 2 | Registo diário | Formulário, filtros e histórico | QA de registo |
| 3.2, módulo 3 | Anti-burnout | Score, níveis e recomendações | QA de cenários |
| 3.3, ODS 3 | Saúde e bem-estar | Descanso, pausas e aviso não clínico | Textos e recomendações |
| 4.1, Scrum | Organização por sprints e quadro de tarefas | Não aplicável ao produto; contexto metodológico | Fora do âmbito do protótipo |
| 4.2, IA ética | IA apenas como apoio de pesquisa | Não é funcionalidade do produto | Fora do âmbito do protótipo |

### 11.1 Desvios assumidos

| Desvio | Motivo | Impacto |
| --- | --- | --- |
| Web em vez de consola | Pedido da iteração e validação de UX | A ergonomia da CLI não é testada |
| Sem backend | Âmbito “apenas HTML + Bootstrap” | Dados limitados ao browser |
| Modelo de risco próprio | O relatório não define fórmula | Heurística precisa de validação futura |
| Perfil fixo | Não há autenticação | Não há personalização real |
| Sem notificações | Fora do âmbito | O utilizador tem de abrir a aplicação |
| Sem exportação | Fora do âmbito | Histórico não é portátil |

---

## 12. Riscos e mitigação

| Risco | Probabilidade | Impacto | Mitigação nesta iteração |
| --- | --- | --- | --- |
| O score ser interpretado como diagnóstico | Média | Alto | Aviso repetido; linguagem preventiva; recomendação de apoio |
| Perda de dados ao limpar o browser | Média | Médio | Documentado; botão de reposição; sem promessa de backup |
| Dados mock serem confundidos com reais | Média | Médio | Etiquetas “demo”, “protótipo” e “apenas protótipo” |
| Seed desatualizado | Baixa | Médio | Seed gerado relativamente à data atual |
| Pesos do risco sem base clínica | Alta | Alto | Declarado como hipótese de design e limitação |
| Metas ECTS variarem por instituição | Média | Médio | Constantes centralizadas em `DEFAULTS` |
| Layout partir em ecrãs estreitos | Baixa | Médio | QA mobile e breakpoints |
| Estado inválido no localStorage | Baixa | Baixo | Validação e reposição automática |
| Scope creep | Média | Médio | Âmbito e não-objetivos explícitos |
| Falta de acessibilidade | Média | Médio | Práticas básicas; auditoria completa fica no roadmap |

---

## 13. Limitações e trabalho futuro

### 13.1 Limitações atuais

- Não há backend, autenticação, sincronização ou multiutilizador.
- O perfil é fixo e demonstrativo.
- As configurações de ECTS, semanas e descanso não têm interface.
- A carga semestral é derivável, mas não tem indicador próprio na interface.
- O histórico não pode ser exportado ou importado.
- Não há lembretes, notificações ou integração com calendário.
- O risco é uma heurística e não foi validado clinicamente.
- Não há migrações de estado além da leitura tolerante.
- A aplicação de consola do relatório não foi implementada.
- A suite Selenium não está no repositório nem em CI.
- A acessibilidade foi tratada por boas práticas, sem auditoria formal.

### 13.2 Roadmap sugerido

**Próxima iteração**

1. Ecrã de configurações para ECTS, semanas, descanso e perfil.
2. Exportação/importação JSON e CSV.
3. Testes de browser versionados e execução em CI.
4. Auditoria de acessibilidade com teclado e leitor de ecrã.
5. Mais testes de limites do motor de risco.

**Iteração com backend**

6. API e base de dados para UCs, registos e preferências.
7. Autenticação e sincronização entre dispositivos.
8. Notificações e lembretes de registo.
9. Integração com calendário académico.
10. Migrações de dados e backups.

**Produto**

11. Validação do modelo de risco com literatura e profissionais.
12. Aplicação de consola alinhada com o relatório original.
13. PWA ou app móvel.
14. Integração institucional, com privacidade e consentimento explícitos.

---

## 14. Reprodução

### 14.1 Executar o protótipo

```bash
cd repo-main
python3 -m http.server 8000
```

Abrir `http://localhost:8000`.

### 14.2 Executar os testes

```bash
node tests/core.test.js
```

### 14.3 Repor o estado

- Na interface: **Repor demo** na topbar ou na vista “Sobre”.
- No browser: apagar a chave `slbt.state.v1` no `localStorage` e recarregar.

### 14.4 Estrutura dos ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `index.html` | Shell, cinco vistas, modais e conteúdo estático |
| `assets/css/styles.css` | Design system, componentes, gráficos e responsividade |
| `assets/js/core.js` | Regras puras, metas, métricas, risco e recomendações |
| `assets/js/data.js` | UCs, plano de aulas, seed e cenários |
| `assets/js/app.js` | Rotas, estado, renderização, CRUD e feedback |
| `tests/core.test.js` | Testes de domínio em Node.js |
| `assets/vendor/` | Bootstrap 5.3.3 e Bootstrap Icons locais |

---

## 15. Conclusão

O protótipo cobre os três módulos do relatório e acrescenta os elementos necessários para os demonstrar: dados mock coerentes, cenários extremos, explicação do risco, confirmação de ações destrutivas e documentação do processo.

A principal decisão foi adaptar a proposta de consola para uma interface web, mantendo as regras de negócio isoladas e testáveis. Esta adaptação permite validar a experiência e a comunicação do risco, mas não substitui a implementação de consola nem uma validação clínica do modelo.

O trabalho deixa uma base clara para a próxima fase: backend, configurações, exportação, notificações e testes end-to-end. As limitações estão explicitadas para que o protótipo seja lido pelo que é: uma ferramenta académica de exploração e validação, não um produto clínico nem uma aplicação oficial do ISEP.

---

## Apêndice A — UCs de demonstração

| UC | Código | ECTS | Contacto | Carga semanal | Meta autónoma |
| --- | --- | ---: | ---: | ---: | ---: |
| Laboratório de Engenharia I | LAPR1 | 6 | 4 h | 8,1 h | 4,1 h |
| Programação I | PROG1 | 6 | 4 h | 8,1 h | 4,1 h |
| Análise Matemática | AM | 6 | 4 h | 8,1 h | 4,1 h |
| Matemática Discreta | MD | 6 | 3 h | 8,1 h | 5,1 h |
| Arquitetura de Computadores | AC | 6 | 3 h | 8,1 h | 5,1 h |
| **Total** | — | **30** | **18 h** | **40,5 h** | **22,5 h** |

## Apêndice B — Glossário

| Termo | Definição |
| --- | --- |
| ECTS | *European Credit Transfer and Accumulation System*; no protótipo, 1 ECTS = 27 h |
| UC | Unidade curricular |
| Estudo autónomo | Trabalho fora de aulas: estudo e projeto/reunião |
| Trabalho académico | Aulas + estudo autónomo |
| Janela móvel | Hoje e os seis dias anteriores |
| Seed | Estado inicial de demonstração |
| Cenário | Conjunto de registos pré-definidos para testar o risco |
| Score | Pontuação heurística de 0 a 100 |
| ODS 3 | Objetivo de Desenvolvimento Sustentável 3: Saúde e Bem-Estar |

---

*Documento produzido para o protótipo académico de LAPR1 2026/27. Última atualização: 2 de novembro de 2026.*

