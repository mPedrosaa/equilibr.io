# Meta autónoma e carga total

Este documento explica como o equilibr.io calcula a **carga total semanal** e a
**meta de estudo autónomo** de cada unidade curricular (UC).

## Variáveis

| Variável | Significado |
| --- | --- |
| `ECTS` | Créditos da UC |
| `27` | Horas de trabalho total por ECTS |
| `20` | Semanas do semestre |
| `contacto_semanal` | Horas de contacto semanais da UC |
| `carga_total_semanal` | Horas totais de trabalho por semana |
| `meta_autonoma` | Horas de estudo fora das aulas por semana |

## Fórmulas

```text
carga_total_semanal = ECTS × 27 ÷ 20

meta_autonoma = max(0, carga_total_semanal − contacto_semanal)
```

O `max(0, …)` evita metas negativas quando as horas de contacto são superiores
à carga total calculada.

## O que é “contacto semanal”

`contacto_semanal` é o número de **horas letivas por semana**: aulas teóricas,
aulas práticas, laboratórios, tutoriais ou outras sessões com horário marcado.

Não é uma projeção de estudo autónomo. O estudo autónomo é precisamente a parte
que sobra depois de descontar essas horas de contacto à carga total da UC.

Exemplo:

```text
UC com 6 ECTS e 4 h de contacto por semana

carga total = 6 × 27 ÷ 20 = 8,1 h
meta autónoma = 8,1 − 4 = 4,1 h
```

## UCs atuais — LEI, 1.º ano, 1.º semestre

| UC | ECTS | Contacto/semana | Carga total/semana | Meta autónoma/semana |
| --- | ---: | ---: | ---: | ---: |
| ALGAN | 5 | 3 h | 6,75 h | 3,75 h |
| APROG | 6 | 4 h | 8,1 h | 4,1 h |
| AMATA | 5 | 3 h | 6,75 h | 3,75 h |
| LAPR1 | 8 | 5 h | 10,8 h | 5,8 h |
| PRCMP | 6 | 4 h | 8,1 h | 4,1 h |
| **Total** | **30** | **19 h** | **40,5 h** | **21,5 h** |

## Onde os valores são usados

- A carga total e a meta autónoma aparecem na página **Unidades curriculares**.
- A meta global é a soma das metas autónomas das UCs.
- Os registos diários de estudo são comparados com a meta global na janela
  móvel de sete dias.
- Alterar ECTS ou horas de contacto recalcula imediatamente estes valores.
