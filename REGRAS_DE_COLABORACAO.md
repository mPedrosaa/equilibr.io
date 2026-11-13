# Regras de Colaboração

## Fluxo de trabalho

- Todas as alterações são integradas na branch `main` exclusivamente através de Pull Requests.
- Não é permitido fazer merge direto na branch `main`.
- Cada Pull Request deve ser revisto e aprovado antes do merge.

## Branches

- O trabalho deve ser realizado em branches criadas a partir da `main`.
- As branches devem ter nomes curtos e descritivos.

## Commits

- Os commits devem ser pequenos, com uma única alteração lógica.
- As mensagens de commit devem ser claras e objetivas.

## Como contribuir, na prática

### 1. Clonar o repositório (apenas na primeira vez)

Antes de começarem a trabalhar, cada pessoa deve clonar o repositório para o seu computador:

```bash
git clone https://github.com/Departamento-de-Engenharia-Informatica/LAPR1-2627-DKL01-Skills-Repo.git
cd LAPR1-2627-DKL01-Skills-Repo
```

### 2. Atualizar a `main` antes de começar

Antes de criar uma branch nova, garantam que a `main` local está atualizada:

```bash
git switch main
git pull origin main
```

Se já tiverem o repositório clonado, é só fazerem estes dois comandos. Nunca comecem a trabalhar numa branch desatualizada.

### 3. Criar uma branch para a alteração

Cada alteração deve ser feita numa branch própria, criada a partir da `main`:

```bash
git switch -c docs/atualizar-readme
```

O nome da branch deve indicar o que se vai fazer. Alguns exemplos:

- `docs/atualizar-readme`
- `fix/corrigir-link`
- `feat/adicionar-pagina-sobre`

### 4. Fazer as alterações e verificar o que mudou

Depois de editarem os ficheiros, vejam o estado do repositório e as alterações feitas:

```bash
git status
git diff
```

Confirmem que só estão a alterar os ficheiros que fazem sentido para aquela tarefa.

### 5. Criar o commit

Adicionem apenas os ficheiros que querem incluir no commit e criem-no com uma mensagem clara:

```bash
git add ficheiro-que-alteraram.md
git commit -m "docs: descrever alteração feita"
```

Evitem usar `git add .` sem verificar primeiro o que vai ser adicionado. Assim evitam incluir ficheiros que não deviam.

### 6. Enviar a branch para o GitHub

```bash
git push -u origin docs/atualizar-readme
```

### 7. Abrir um Pull Request

1. Abram o repositório no GitHub.
2. Vão a **Pull requests** e escolham **New pull request**.
3. Escolham a branch `main` como base e a vossa branch como compare.
4. Escrevam um título e uma descrição curta do que foi alterado.
5. Criem o Pull Request e peçam a revisão de outro membro da equipa.

Depois da revisão e aprovação, o Pull Request pode ser integrado na `main`. Nunca façam merge diretamente na `main` nem usem `git push --force`.
