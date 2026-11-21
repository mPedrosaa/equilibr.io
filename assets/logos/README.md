# Conceitos de símbolo — equilibr.io

Cada ficheiro é um conceito **diferente** de símbolo pequeno, não uma variação
de layout do mesmo logo. Todos seguem a estética do produto: preto e branco,
traço simples, tipografia serifada e formas direitas.

Ver tudo em [`preview.html`](./preview.html) (abrir no browser) ou na imagem
[`preview.png`](./preview.png).

## 1. Só linha

| Ficheiro | Conceito |
| --- | --- |
| `linha-caixa-singular.svg` | **Escolhido.** Pulso dentro de uma caixa única. É o logo usado no site, na app e no favicon. |
| `linha-pulso.svg` | Linha de cardiograma pura, sem moldura. |
| `linha-caixa.svg` | Pulso dentro de uma caixa dupla — selo/ícone fechado. |
| `linha-balanco.svg` | Sinal de equilíbrio (`=`): uma linha reta e uma linha com pulso. |
| `linha-mira.svg` | Pulso sobre uma mira vertical, como um monitor. |

## 2. Só eq

| Ficheiro | Conceito |
| --- | --- |
| `eq-classico.svg` | `eq` serifado, solto. |
| `eq-geometrico.svg` | `eq` construído com círculos e hastes, sem serifa. |
| `eq-invertido.svg` | `eq` branco sobre bloco preto. |

## 3. eq + linha

| Ficheiro | Conceito |
| --- | --- |
| `ambos-base.svg` | `eq` por cima de um pulso. É a versão usada atualmente na app. |
| `ambos-q-pulso.svg` | O descendente do `q` prolonga-se para a direita num pulso. |
| `ambos-coluna.svg` | `e` em cima, pulso no meio e `q` em baixo — leitura vertical. |

## 4. Exóticos

| Ficheiro | Conceito |
| --- | --- |
| `exotico-balanco.svg` | Balança cuja trave é um pulso. |
| `exotico-ampulheta.svg` | Ampulheta com o pulso como areia. |
| `exotico-coracao.svg` | Coração com o pulso recortado lá dentro. |
| `exotico-dia-noite.svg` | Círculo meio cheio (descanso) e meio com pulso (estudo). |

## Notas técnicas

- Os SVG com `eq` usam texto (`Times New Roman` / `Liberation Serif`). Para
  independentizar da fonte do sistema, os glifos podem ser convertidos em `path`.
- O símbolo realmente usado no site é `linha-caixa-singular.svg` (inline, com
  `currentColor`). O favicon está em `assets/img/favicon.svg`.
- O `eq` deixou de fazer parte da marca; os conceitos com `eq` ficam apenas
  como alternativas arquivadas.
- Para trocar o símbolo do site por outro destes conceitos, é necessário
  repetir o respetivo SVG inline na navbar de cada página e na sidebar da app.
