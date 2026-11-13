# Modelo de cálculo do risco de burnout

**equilibr.io (ISEP Study-Life Balance Tracker)** · LAPR1 2026/27  
Documento de fundamentação do modelo · 13 de novembro de 2026

[← Voltar ao README](../README.md) · [Processo de desenvolvimento](PROCESSO.md)

---

## 1. Objetivo

Este documento explica:

1. qual é o modelo usado pelo equilibr.io para calcular o risco de burnout;
2. como a fórmula foi construída;
3. porque pode ser considerada uma aproximação aceitável da realidade académica;
4. em que condições a ferramenta é útil;
5. quais são os seus limites e como deveria ser validada numa fase seguinte.

O modelo não é um instrumento clínico. É um **indicador heurístico de bem-estar académico**, pensado para tornar visíveis padrões de esforço, recuperação e acumulação de carga.

---

## 2. Natureza do modelo

O equilibr.io usa um **modelo aditivo ponderado com saturação**:

- cada fator produz uma pontuação parcial;
- as pontuações parciais são somadas;
- o resultado é limitado ao intervalo de 0 a 100.

A pontuação final **não é uma probabilidade**. Um resultado de 39/100 não significa “39% de probabilidade de burnout”. Significa apenas que o conjunto de indicadores observados se encontra num nível intermédio de atenção.

O modelo é:

- **determinístico** — os mesmos registos produzem sempre a mesma pontuação;
- **explicável** — cada ponto pode ser atribuído a um fator concreto;
- **monotónico** — em geral, mais carga e menos descanso aumentam o risco; mais descanso reduz o risco;
- **não clínico** — não diagnostica, não substitui acompanhamento profissional e não mede todas as dimensões do burnout.

---

## 3. Dados de entrada

O modelo trabalha sobre uma **janela móvel de sete dias**: hoje e os seis dias anteriores.

Esta janela foi escolhida por duas razões:

- reflete o esforço recente, em vez de depender de uma semana fixa de segunda a domingo;
- evita que o risco pareça artificialmente baixo no início da semana.

Variáveis usadas:

| Símbolo | Significado | Origem |
| --- | --- | --- |
| `E` | Minutos de estudo autónomo e de projeto na janela | Registos do tipo `estudo` e `projeto` |
| `A` | Minutos de aulas na janela | Registos do tipo `aula` |
| `D` | Minutos de descanso registados na janela | Registos do tipo `descanso` |
| `T` | Meta semanal de estudo autónomo | Soma das metas calculadas a partir dos ECTS |
| `D*` | Meta semanal de descanso | 14 horas por omissão |
| `S` | Dias consecutivos com estudo ou projeto | Sequência calculada a partir dos registos |
| `M` | Média diária de estudo autónomo | `E ÷ 7`, em horas |
| `L` | Duração da sessão mais longa | Máximo entre registos de estudo e projeto |

A meta autónoma de cada UC é calculada por:

```text
carga semanal da UC = (ECTS × 27) ÷ 20
meta autónoma da UC = max(0, carga semanal da UC − horas de contacto)
```

No conjunto de dados atual, a meta global é de **21,5 horas por semana**.

---

## 4. Fórmula

O risco é calculado como:

```text
score = clamp(
  f_sequencia(S)
  + f_carga(E ÷ T)
  + f_descanso(D ÷ D*)
  + f_media(M)
  + f_sessao(L),
  0, 100
)
```

A soma teórica máxima dos fatores é **105**, mas o resultado é truncado em 100. Esta saturação é intencional: o topo da escala representa situações de alerta extremo, onde a diferença entre 100 e 105 não acrescenta informação útil. A limitação desta opção está discutida na secção 7.

### 4.1 Fator 1 — Dias consecutivos de estudo

| Condição | Pontos |
| --- | ---: |
| 10 ou mais dias | 30 |
| 7 a 9 dias | 22 |
| 5 a 6 dias | 12 |
| 3 a 4 dias | 4 |
| 0 a 2 dias | 0 |

**Racional:** a ausência de pausas é um sinal de exposição prolongada. Três dias marcam o início de um padrão; sete dias cobrem uma semana completa sem interrupção; dez dias sugerem acumulação continuada.

### 4.2 Fator 2 — Carga face à meta semanal

| Rácio `E ÷ T` | Pontos |
| --- | ---: |
| 150% ou mais | 30 |
| 125% a 149% | 20 |
| 110% a 124% | 10 |
| Menos de 110% | 0 |

**Racional:** 100% da meta é o valor esperado. A partir de 110% há desvio ligeiro; a partir de 125% o desvio é relevante; a partir de 150% a carga está claramente acima do planeado.

### 4.3 Fator 3 — Descanso registado

| Descanso face à meta `D ÷ D*` | Pontos |
| --- | ---: |
| Menos de 25% | 20 |
| 25% a 49% | 12 |
| 50% a 74% | 6 |
| 75% ou mais | 0 |

**Racional:** a meta de 14 horas por semana corresponde a uma média de 2 horas por dia. Abaixo de 75% da meta há défice; abaixo de 50% o défice é importante; abaixo de 25% existe privação severa de recuperação registada.

### 4.4 Fator 4 — Média diária de estudo autónomo

| Média `M` | Pontos |
| --- | ---: |
| 7 ou mais horas por dia | 15 |
| 5 a 6,9 horas por dia | 8 |
| Menos de 5 horas por dia | 0 |

**Racional:** a meta de 21,5 horas por semana corresponde a cerca de 3,1 horas por dia. Cinco horas por dia representam mais de 160% da meta diária; sete horas por dia representam mais do dobro.

### 4.5 Fator 5 — Sessão mais longa

| Duração `L` | Pontos |
| --- | ---: |
| 4 ou mais horas | 10 |
| 3 a 3,9 horas | 5 |
| Menos de 3 horas | 0 |

**Racional:** sessões muito longas são um sinal agudo de esforço continuado e de ausência de pausas. Este fator tem o peso mais baixo porque uma sessão isolada é menos informativa do que um padrão semanal.

### 4.6 Níveis

| Pontuação | Nível |
| ---: | --- |
| 0–24 | Baixo |
| 25–49 | Moderado |
| 50–74 | Elevado |
| 75–100 | Crítico |

---

## 5. Como a fórmula foi obtida

A fórmula **não foi obtida por regressão estatística nem calibrada com dados clínicos**. Foi construída por um processo de **operacionalização de um construto** a partir dos requisitos do relatório do Sprint 1.

### 5.1 Ponto de partida

O relatório identifica a necessidade de monitorizar fadiga, sobrecarga e risco de burnout, mas **não define uma fórmula**. Foi necessário traduzir esse objetivo em indicadores observáveis a partir dos dados que o protótipo já recolhe.

### 5.2 Decomposição em dimensões observáveis

O grupo identificou quatro dimensões mensuráveis:

1. **Exposição acumulada** — quantos dias seguidos o estudante mantém estudo autónomo.
2. **Desvio face ao planeado** — quanto o esforço semanal excede a meta calculada por ECTS.
3. **Recuperação** — quanto descanso foi registado face à meta semanal.
4. **Intensidade** — média diária e duração da sessão mais longa.

Estas dimensões não esgotam o conceito de burnout, mas cobrem os seus sinais mais diretamente observáveis no modelo de dados disponível.

### 5.3 Atribuição de pesos

Os pesos foram atribuídos por julgamento de equipa, segundo uma lógica de relevância preventiva:

| Dimensão | Peso máximo | Justificação |
| --- | ---: | --- |
| Carga face à meta | 30 | É o desvio mais direto entre esforço realizado e esforço planeado |
| Sequência de estudo | 30 | Representa acumulação sem pausas e exposição continuada |
| Descanso | 20 | É a principal dimensão protetora observável |
| Média diária | 15 | Mede a intensidade do padrão diário |
| Sessão mais longa | 10 | Sinal agudo, mas menos estável do que o padrão semanal |

A soma é 105. O truncamento em 100 permite que situações extremas saturem a escala sem alterar a leitura dos níveis mais baixos.

### 5.4 Escolha dos limiares

Os limiares foram escolhidos com âncoras simples e verificáveis:

- percentagens redondas da meta semanal — 110%, 125% e 150%;
- percentagens redondas da meta de descanso — 25%, 50% e 75%;
- valores diários facilmente interpretáveis — 5 e 7 horas;
- durações de sessão reconhecíveis — 3 e 4 horas;
- sequências de 3, 5, 7 e 10 dias.

Estes valores são **hipóteses de design**, não constantes clínicas. Foram escolhidos para produzir uma progressão legível e para permitir testar o comportamento do motor com cenários extremos.

### 5.5 Calibração por cenários e testes

O modelo foi verificado com quatro cenários:

| Cenário | Estudo autónomo | Descanso | Sequência | Pontuação | Nível |
| --- | ---: | ---: | ---: | ---: | --- |
| Base | 21,0 h | 6,5 h | 7 dias | 39 | Moderado |
| Equilibrado | 16,0 h | 15,5 h | 6 dias | 12 | Baixo |
| Sobrecarga | 37,0 h | 0 h | 7 dias | 90 | Crítico |
| Recuperação | 7,0 h | 20,5 h | 1 dia | 0 | Baixo |

Os testes de domínio verificam ainda:

- o limite inferior e superior da pontuação;
- a soma correta dos fatores;
- a independência da janela de sete dias;
- o comportamento da sequência quando ainda não há estudo hoje;
- a coerência entre metas por UC e meta global.

Esta verificação não prova validade clínica. Prova apenas que a implementação é **determinística, limitada e coerente com as regras definidas**.

---

## 6. Porque é uma aproximação aceitável

### 6.1 Cobertura das dimensões centrais

A literatura sobre burnout académico e ocupacional descreve o fenómeno como resultado de exigências prolongadas sem recuperação suficiente. O modelo cobre precisamente:

- exigência elevada — carga face à meta e média diária;
- exposição continuada — sequência de dias;
- défice de recuperação — descanso registado;
- esforço agudo — sessão mais longa.

Não mede todas as dimensões do burnout, mas mede algumas das que estão mais diretamente ligadas à sobrecarga académica.

### 6.2 Validade facial

Cada fator tem uma interpretação direta:

- “estudei acima da meta”;
- “não registei descanso suficiente”;
- “estou há muitos dias sem pausa”;
- “tive uma sessão demasiado longa”.

Esta transparência é importante num protótipo: o utilizador consegue perceber **porque** o risco subiu e o que pode fazer para o reduzir.

### 6.3 Comportamento esperado

O modelo respeita relações intuitivas:

- aumentar o estudo sem aumentar o descanso não reduz o risco;
- aumentar o descanso tende a reduzir a pontuação;
- sequências mais longas aumentam o risco;
- sessões extremas acrescentam um sinal de alerta;
- uma semana equilibrada produz risco baixo;
- uma semana de sobrecarga sem descanso produz risco crítico.

Os cenários de teste confirmam esta ordenação.

### 6.4 Transparência e testabilidade

Ao contrário de um modelo opaco, a fórmula é:

- legível;
- reproduzível;
- testável com casos-limite;
- alterável sem reescrever a aplicação;
- auditável por qualquer membro da equipa.

Para um protótipo académico, esta transparência vale mais do que uma precisão estatística que não pode ser demonstrada com os dados disponíveis.

### 6.5 Utilidade prática

O modelo é útil porque:

- transforma registos dispersos num indicador único e compreensível;
- ajuda o estudante a detetar padrões de acumulação;
- explica a origem do risco;
- gera recomendações concretas;
- permite comparar cenários;
- serve de base para uma futura calibração mais rigorosa.

A ferramenta não pretende substituir o julgamento do estudante nem o apoio de profissionais. Pretende funcionar como **sinal precoce** e como **apoio à autorregulação**.

---

## 7. Limitações

O modelo deve ser lido com as seguintes reservas:

1. **Não foi validado clinicamente.** Os pesos e limiares são hipóteses de design.
2. **Não mede todas as dimensões do burnout.** O burnout inclui exaustão, cinismo e redução da eficácia; o modelo aproxima sobretudo a sobrecarga e o défice de recuperação.
3. **Depende de autorregisto.** Se o estudante não registar descanso, o modelo penaliza-o injustamente.
4. **A pontuação não é uma probabilidade.** É um índice heurístico de atenção.
5. **Os fatores estão correlacionados.** Carga e média diária são proporcionais quando a meta é fixa; a sequência e a carga também tendem a variar juntas.
6. **A soma máxima é 105 e é truncada em 100.** O topo da escala satura.
7. **A janela de sete dias é curta.** Pode não captar padrões crónicos ou ciclos de avaliação mais longos.
8. **O modelo não considera sono, saúde mental, apoio social, contexto pessoal ou desempenho académico.**
9. **Os limiares são arbitrários na sua origem**, ainda que justificáveis pela lógica de prevenção.
10. **O modelo pode gerar falsos positivos**, sobretudo em estudantes que descansam mas não registam esse descanso. Num instrumento preventivo, algum excesso de sensibilidade é preferível à omissão, mas deve ser comunicado com cuidado.

---

## 8. Como validar numa fase seguinte

Para passar de heurística a instrumento com maior validade, seria necessário:

1. **Revisão por especialistas** — psicólogos, serviços de apoio ao estudante e docentes.
2. **Estudo-piloto com dados anonimizados** — recolher registos durante várias semanas.
3. **Comparação com instrumentos validados** — por exemplo, escalas de burnout académico e medidas de recuperação.
4. **Análise de sensibilidade** — testar o efeito de alterar pesos e limiares.
5. **Calibração estatística** — ajustar o modelo com regressão ou outro método, se existirem dados suficientes.
6. **Validação preditiva** — verificar se o indicador antecipa semanas de maior exaustão ou menor desempenho.
7. **Análise de equidade** — verificar se o modelo penaliza sistematicamente determinados perfis de estudante.
8. **Testes de usabilidade** — confirmar que o utilizador compreende o indicador e não o interpreta como diagnóstico.

---

## 9. Conclusão

A fórmula do equilibr.io é uma **heurística aditiva, transparente e explicável**, construída a partir de indicadores observáveis de carga, continuidade, descanso e intensidade.

Não pode ser apresentada como um modelo clínico validado. Pode, no entanto, ser apresentada como uma **aproximação razoável e útil** para um protótipo académico, desde que sejam explicitados os seus pressupostos e limites. A sua principal qualidade não está na precisão estatística, mas na capacidade de tornar visível um problema real — a acumulação de esforço sem recuperação — e de o comunicar de forma compreensível e acionável.

---

## 10. Referências de apoio

Estas referências fundamentam as dimensões gerais do modelo. Não validam os pesos ou limiares concretos usados no protótipo.

- Bakker, A. B., & Demerouti, E. (2007). The Job Demands-Resources model: State of the art. *Journal of Managerial Psychology, 22*(3), 309–328.
- Maslach, C., & Jackson, S. E. (1981). The measurement of experienced burnout. *Journal of Occupational Behaviour, 2*(2), 99–113.
- Maslach, C., Schaufeli, W. B., & Leiter, M. P. (2001). Job burnout. *Annual Review of Psychology, 52*, 397–422.
- Sonnentag, S., & Fritz, C. (2007). The Recovery Experience Questionnaire: Development and validation of a measure for assessing recuperation and unwinding from work. *Journal of Occupational Health Psychology, 12*(3), 204–221.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.
