# Equilibra

Protótipo web do **Equilibra** (ISEP Study-Life Balance Tracker), desenvolvido no âmbito de **LAPR1 2026/27** pelo grupo **“Quarteto Maravilha”**.

A aplicação transforma a carga letiva em metas semanais de estudo autónomo, permite registar a atividade diária e calcula um indicador preventivo de risco de burnout. É um protótipo académico: não é uma aplicação oficial do ISEP nem substitui acompanhamento clínico.

![Visão geral do protótipo](docs/screenshots/dashboard.png)

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Como executar](#como-executar)
- [Dados de demonstração](#dados-de-demonstração)
- [Regras de cálculo](#regras-de-cálculo)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Decisões técnicas](#decisões-técnicas)
- [Testes](#testes)
- [Limitações](#limitações)
- [Documentação e equipa](#documentação-e-equipa)

## Sobre o projeto

O relatório do Sprint 1 descreve uma aplicação de consola com três módulos:

1. **Gestão de ECTS** — converte créditos em horas semanais e desconta as horas de contacto.
2. **Registo diário** — regista aulas, estudo autónomo, projeto e descanso por unidade curricular.
3. **Anti-burnout** — analisa a atividade recente e sinaliza sobrecarga e falta de descanso.

Este protótipo mantém as mesmas regras de negócio, mas adapta os fluxos a uma interface web navegável. O objetivo é validar a experiência, a hierarquia da informação e o motor de risco antes de uma implementação com backend. A justificação desta adaptação está documentada em [`docs/PROCESSO.md`](docs/PROCESSO.md).

### Contexto

| Item | Valor |
| --- | --- |
| Unidade curricular | LAPR1 2026/27 |
| Turma | LAPR1-2627-DKL01-Skills |
| Grupo | Quarteto Maravilha |
| Elementos | Nuno Sousa, Miguel Pedrosa, Rodrigo Pinheiro e Sofia de Souza |
| Fonte funcional | `Relatório 1 - SPRINT 1 (1).pdf` |

## Funcionalidades

### Painel de visão geral

- Cartão de risco de burnout com pontuação de 0 a 100 e nível qualitativo.
- Indicadores de estudo autónomo, descanso, sequência de estudo e risco.
- Gráfico dos últimos sete dias com trabalho académico e descanso.
- Lista de sinais de atenção e metas por unidade curricular.
- Últimos registos e atalhos para as ações principais.

### Gestão de ECTS

- Criar, editar e eliminar unidades curriculares.
- Campos de nome, código, ECTS, horas de contacto semanais e cor.
- Cálculo automático da meta autónoma semanal por UC.
- Totais de ECTS, carga semanal, horas de contacto e estudo autónomo.
- Validação de códigos duplicados e de valores inválidos.
- Eliminação de uma UC remove também os registos associados, após confirmação.

### Registo diário

- Registo de aulas, estudo autónomo, projeto/reunião e descanso.
- Associação a uma UC, exceto para descanso, que é transversal.
- Durações rápidas de 30, 60, 90 e 120 minutos.
- Validação de datas futuras, durações e campos obrigatórios.
- Histórico ordenado por data, com filtros por período, UC e tipo.
- Resumos de trabalho académico, estudo autónomo e descanso para o período filtrado.
- Eliminação de registos com confirmação.

### Anti-burnout

- Pontuação de 0 a 100 calculada a partir de cinco fatores.
- Níveis **Baixo**, **Moderado**, **Elevado** e **Crítico**.
- Decomposição da pontuação por fator, com pontos e explicação.
- Recomendações geradas a partir dos fatores com pontuação positiva.
- Radar de hábitos, mapa semanal e aviso de que o indicador é uma heurística de bem-estar.
- Laboratório de cenários para testar rapidamente situações de equilíbrio, sobrecarga e recuperação.

### Experiência de utilização

- Navegação SPA por rotas de hash (`#dashboard`, `#ects`, `#registo`, `#burnout`, `#sobre`).
- Layout responsivo: barra lateral fixa em desktop e menu offcanvas em mobile.
- Persistência no `localStorage` do browser.
- Toasts de feedback e modais de confirmação para ações destrutivas.
- Reposição da demonstração a qualquer momento.
- Conteúdo em português europeu (pt-PT).

## Como executar

Não há processo de build, instalação de dependências ou backend. O Bootstrap 5.3.3 e os Bootstrap Icons estão incluídos localmente em `assets/vendor/`.

### Opção recomendada: servidor HTTP local

Na raiz do projeto:

```bash
python3 -m http.server 8000
```

Depois abrir:

```text
http://localhost:8000
```

Também pode ser usado qualquer outro servidor estático, por exemplo:

```bash
npx serve .
```

### Abrir diretamente

O ficheiro `index.html` também pode ser aberto no browser. Ainda assim, o servidor local é recomendado para garantir um comportamento consistente do `localStorage` entre sessões.

### Requisitos

- Browser moderno com suporte a JavaScript, CSS custom properties e `Intl`.
- Python 3 ou Node.js apenas para servir os ficheiros localmente.
- Node.js 18 ou superior para executar os testes de domínio.

## Dados de demonstração

No primeiro arranque, o protótipo cria automaticamente um cenário demonstrativo relativo à data atual.

| Indicador | Valor inicial |
| --- | --- |
| Unidades curriculares | 5 |
| ECTS inscritos | 30 |
| Horas de contacto semanais | 19 h |
| Carga total semanal | 40,5 h |
| Meta de estudo autónomo | 21,5 h |
| Estudo autónomo registado | 21,0 h |
| Descanso registado | 6,5 h |
| Sequência de estudo | 7 dias |
| Risco de burnout | 39/100 · Moderado |

O botão **Repor demo** repõe as UCs, os registos e o perfil de demonstração. A reposição substitui os dados existentes e pede confirmação.

### Cenários disponíveis

O laboratório de cenários substitui apenas os registos dos últimos sete dias. As unidades curriculares mantêm-se.

| Cenário | Estudo autónomo | Descanso | Sequência | Risco | Nível |
| --- | ---: | ---: | ---: | ---: | --- |
| Base | 21,0 h | 6,5 h | 7 dias | 39 | Moderado |
| Equilibrado | 16,0 h | 15,5 h | 6 dias | 12 | Baixo |
| Sobrecarga | 37,0 h | 0 h | 7 dias | 90 | Crítico |
| Recuperação | 7,0 h | 20,5 h | 1 dia | 0 | Baixo |

Os cenários servem para validar os limites do motor de risco e não representam dados reais de estudantes.

## Regras de cálculo

### Meta de estudo autónomo

O modelo assume:

- **1 ECTS = 27 horas** de trabalho total.
- **Semestre = 20 semanas**.
- A meta autónoma desconta as horas de contacto semanais.

```text
carga semanal da UC = (ECTS × 27) ÷ 20
meta autónoma da UC = max(0, carga semanal da UC − horas de contacto)
```

Exemplo: uma UC de 6 ECTS com 4 horas de contacto semanais tem uma carga total de 8,1 h e uma meta autónoma de 4,1 h por semana.

A meta global é a soma das metas de todas as UCs.

### Janela de análise

Os indicadores de estudo, descanso, sequência e risco usam uma **janela móvel de sete dias**: hoje e os seis dias anteriores. Esta escolha evita que o risco pareça artificialmente baixo no início da semana e reflete o esforço recente.

### Motor anti-burnout

A pontuação é uma soma de cinco fatores, limitada ao intervalo 0–100.

| Fator | Condição | Pontos máximos |
| --- | --- | ---: |
| Dias consecutivos de estudo | ≥ 10 dias: 30 · 7–9: 22 · 5–6: 12 · 3–4: 4 | 30 |
| Carga face à meta semanal | ≥ 150%: 30 · 125–149%: 20 · 110–124%: 10 | 30 |
| Descanso registado | < 25% da meta: 20 · 25–49%: 12 · 50–74%: 6 | 20 |
| Média diária de estudo autónomo | ≥ 7 h: 15 · 5–6,9 h: 8 | 15 |
| Sessão mais longa | ≥ 4 h: 10 · 3–3,9 h: 5 | 10 |

A meta de descanso predefinida é de **14 horas por semana**.

| Pontuação | Nível |
| --- | --- |
| 0–24 | Baixo |
| 25–49 | Moderado |
| 50–74 | Elevado |
| 75–100 | Crítico |

O motor apresenta recomendações quando um fator soma pontos. A pontuação é uma heurística de bem-estar, não um diagnóstico nem um instrumento clínico.

## Estrutura do projeto

```text
.
├── index.html                     # Shell, vistas, modais e conteúdo estático
├── assets/
│   ├── css/
│   │   └── styles.css             # Design system, componentes e responsividade
│   ├── js/
│   │   ├── core.js                # Regras de negócio puras e motor de risco
│   │   ├── data.js                # UCs mock, dados demo e cenários
│   │   └── app.js                 # Rotas, estado, renderização e CRUD
│   └── vendor/
│       ├── bootstrap/             # Bootstrap 5.3.3 local
│       └── bootstrap-icons/       # Ícones locais
├── tests/
│   └── core.test.js               # 13 testes de domínio com Node.js
├── docs/
│   ├── PROCESSO.md                # Processo de desenvolvimento e rastreabilidade
│   └── screenshots/               # Evidências visuais desktop e mobile
├── README.md
└── Relatório 1 - SPRINT 1 (1).pdf # Relatório de origem
```

### Camadas

- **`core.js`** não depende do DOM nem do Bootstrap. Pode ser executado no browser ou em Node.js e é coberto pelos testes.
- **`data.js`** contém os dados ilustrativos, o gerador de estado inicial e os cenários de demonstração.
- **`app.js`** liga o estado à interface, gere rotas, `localStorage`, filtros, modais e toasts.
- **`styles.css`** define os tokens visuais, componentes próprios, gráficos em CSS e breakpoints.

## Decisões técnicas

- **HTML + Bootstrap 5.3.3 + JavaScript vanilla.** Não há React, Vue ou outra framework de UI. O objetivo é manter o protótipo leve, sem build e fácil de inspecionar.
- **Assets locais.** Bootstrap e Bootstrap Icons estão guardados em `assets/vendor/`, permitindo executar o protótipo sem CDN.
- **SPA com hash routing.** Funciona em qualquer servidor estático, sem regras de rewrite.
- **`localStorage` com a chave `equilibra.state.v2`.** Não existe backend, conta de utilizador ou sincronização.
- **Separar domínio de interface.** As fórmulas e o motor de risco vivem em `core.js` e podem ser testados sem browser.
- **Gráficos em CSS.** Não foi adicionada uma biblioteca de charts; os gráficos são barras, gauge, heatmap e progressos construídos com HTML/CSS.
- **Dados demo relativos à data atual.** O cenário inicial é recalculado no arranque para que a demonstração continue coerente em qualquer dia.
- **Confirmação antes de ações destrutivas.** Eliminar UCs, eliminar registos e repor a demo usam um modal comum.

## Testes

### Testes de domínio

```bash
node tests/core.test.js
```

Resultado atual: **13 testes concluídos com sucesso**.

Cobrem datas e janela móvel, conversão ECTS, metas por UC, dados iniciais, cenários, sequência de estudo, limites da pontuação e casos de meta zero.

### Validação funcional no browser

Durante o desenvolvimento foi executada uma suite de **30 verificações Selenium** em Firefox headless, com **0 erros JavaScript**. A suite validou:

- indicadores e gráfico do dashboard;
- criação, edição e eliminação de UCs;
- recálculo da meta após alterar horas de contacto;
- criação e eliminação de registos;
- persistência após recarregar a página;
- cenários de sobrecarga, equilíbrio e reposição da demo;
- validação de formulário;
- menu offcanvas e navegação em viewport mobile (500 × 758 px efetivos).

A suite Selenium foi uma ferramenta de QA do ambiente de desenvolvimento e não faz parte do runtime da aplicação.

### Verificação visual

As capturas em [`docs/screenshots/`](docs/screenshots/) mostram as cinco vistas em desktop (1440 × 1114 px) e duas vistas em mobile (500 × 758 px).

## Limitações

- Não existe backend, autenticação, sincronização entre dispositivos ou multiutilizador.
- Os dados ficam apenas no browser. Limpar o armazenamento elimina o histórico.
- O perfil é demonstrativo e não editável na interface.
- A meta de descanso e as constantes ECTS estão no código; não há ecrã de configurações.
- O risco é uma heurística de bem-estar, não uma avaliação clínica.
- Não existem exportação, notificações, integração com calendário ou lembretes.
- Não existem migrações de dados além da leitura tolerante do formato atual.
- O protótipo não implementa a aplicação de consola descrita no relatório; valida os fluxos numa interface web.
- A suite Selenium não está incluída no repositório e não corre em CI.

## Documentação e equipa

- [`docs/PROCESSO.md`](docs/PROCESSO.md) — análise do relatório, requisitos, decisões, modelo de dados, implementação, QA e roadmap.
- [`docs/MODELO_BURNOUT.md`](docs/MODELO_BURNOUT.md) — fundamentação do modelo de risco, pressupostos, utilidade e limites.
- [`docs/screenshots/`](docs/screenshots/) — evidências visuais.

Trabalho desenvolvido no âmbito de **LAPR1 2026/27**, turma **LAPR1-2627-DKL01-Skills**, pelo grupo **“Quarteto Maravilha”**: Nuno Sousa, Miguel Pedrosa, Rodrigo Pinheiro e Sofia de Souza.

Protótipo académico independente. Não é uma aplicação oficial do ISEP.
