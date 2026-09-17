# Diretrizes do Workspace: Modo Agent-Assisted

Este workspace está configurado para operar no modo **Agent-Assisted** com as seguintes políticas de operação e execução:

---

## 1. Execução Automática no Terminal (Comandos Seguros)
Você tem autonomia para propor e executar comandos no terminal de forma direta e automática, **desde que sejam seguros, informativos e não destrutivos**, incluindo:

- **Inspeção e Leitura:** `dir`, `ls`, `cat`, `type`, `find`, `grep`, `git status`, `git log`, `git diff`, etc.
- **Checagem de Ambiente:** consultas de versões (`node -v`, `python --version`, `git --version`, etc.).
- **Build / Lint / Testes:** rodar suites de testes (`npm test`, `pytest`), linters e formatadores.
- **Instalação e Compilação Padrão:** restauração de dependências rotineiras (`npm install`, `pip install -r requirements.txt`) dentro do contexto do projeto.

---

## 2. Comandos que Exigem Confirmação / Cautela Extra
NÃO execute automaticamente comandos destrutivos ou irreversíveis sem avisar e confirmar:
- Exclusão em massa ou forçada de arquivos/pastas (`rm -rf`, `git reset --hard`, `git clean -fd`, `del /s /q`).
- Alterações em bancos de dados de produção / migrações destrutivas (`DROP`, `TRUNCATE`).
- Envio de código remoto ou ações com impacto externo (`git push --force`, deleção de branches remotas).

---

## 3. Modificações Estruturais e Planos de Mudança (Revisão Obrigatória)
Antes de aplicar qualquer mudança ampla de arquitetura ou executar planos de grande impacto:

1. **Parar e Planejar:** Utilize o modo de planejamento para descrever a abordagem (`implementation_plan.md`).
2. **Solicitar Revisão Prévia:** Detalhe os componentes afetados, impacto, passos e trade-offs.
3. **Aguardar Aprovação Explícita:** Não aplique alterações em múltiplos módulos/arquitetura até que o usuário revise e confirme o plano.
4. **Tarefas Pontuais:** Tweaks, correções pontuais de sintaxe e investigações simples podem prosseguir sem burocracia de plano formal — **exceto** quando envolverem qualquer arquivo listado na "Regra permanente" do `CONTEXT.md` (módulo Bíblia), caso em que a confirmação prévia é sempre obrigatória, sem exceção.

### 3.1 Execução do módulo de Livros (`docs/Plano_Implementacao_Livros_v2.md`)
- Execute **uma fase por vez**, exatamente na ordem do documento. Nunca avance para a fase seguinte por conta própria, mesmo que pareça um próximo passo óbvio ou trivial.
- Ao final de cada fase, pare e apresente um resumo dos arquivos criados/alterados (`git diff --stat`) para revisão do usuário antes de continuar.
- Nunca combine duas fases numa única resposta, mesmo que o usuário não peça explicitamente para parar entre elas — a pausa entre fases é a regra padrão deste projeto.
- Se, em qualquer fase, a implementação exigir tocar em um arquivo fora do escopo previsto para aquela fase (especialmente qualquer arquivo do módulo Bíblia), pare imediatamente e pergunte antes de prosseguir.
