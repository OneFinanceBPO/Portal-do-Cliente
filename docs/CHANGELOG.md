# Changelog — Portal do Cliente One Finance

Todas as mudanças notáveis neste projeto estão documentadas neste arquivo.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [2.0.0] — 2026-06-02

### Segurança
- **Cloudflare Worker proxy** para escrita no GitHub — token nunca exposto no navegador (`js/sync.js`, `cloudflare-worker.js`)
- **Autenticação com sessionStorage** — sessão limpa ao fechar a aba, sem dados persistidos em localStorage (`js/auth.js`)
- **Session timeout** — logout automático após 20 min de inatividade com aviso em countdown (`js/session-timeout.js`)
- **Hash SHA-256** nas senhas de perfis via `crypto.subtle.digest`
- **Modo legado** com token GitHub direto mantido para compatibilidade retroativa
- **Indicador de força de senha** com 4 critérios visuais no cadastro de perfis

### Novas Funcionalidades
- **Recuperação de senha** — `recuperar-senha.html` gera token de 30 min; `nova-senha.html` valida e atualiza o hash (`feat 2.1`)
- **Log de atividades** — `js/activity-log.js` registra login, logout, CRUD de clientes/perfis, sync e eventos de segurança, com filtro por categoria e exportação CSV (`feat 2.2`)
- **Busca em tempo real** na lista de clientes com highlight de termo, filtro por segmento e ordenação (`feat 2.3`)
- **Tour de onboarding** — `js/onboarding.js` com spotlight, popover posicionado dinamicamente, 5 passos, auto-exibe para novos usuários, botão `?` para reiniciar (`feat 3.1`)
- **Página de perfil** — `perfil.html` com dados da sessão, último login, contador de empresas e troca de senha autenticada (`feat 3.2`)
- **Avatar dropdown** no header do gerenciamento com "Meu Perfil" e "Sair", iniciais calculadas da sessão (`feat 3.2`)
- **Política de Privacidade** — `privacidade.html` com 8 seções em conformidade com a LGPD, linkada no rodapé do login (`feat 4.1`)
- **Toasts** — `js/toast.js` com 4 tipos (success, error, warning, info), empilháveis, no canto inferior direito (`feat 2.4`)

### UI / UX
- **Responsividade mobile** — hamburger menu com sidebar deslizante e overlay em todas as páginas, modais adaptados, grid de clientes em coluna única abaixo de 900 px (`feat 3.3`)
- **Filtro de mês** — dropdown estilo macOS com ✓ nas seleções, sem caixas de checkbox visíveis, auto-seleciona o mês atual em todas as abas de relatório
- **Estado vazio** na lista de clientes com mensagem amigável ao buscar sem resultados

### Melhorias
- Gerenciamento de perfis com acesso baseado em `tipo: adm/limitado`
- Sair button em todas as páginas autenticadas registra evento no log antes de limpar a sessão
- Seção "Modo Recomendado (Worker)" vs "Modo Legado" no modal de sincronização

---

## [1.0.0] — 2025-05

### Versão inicial
- Portal com login e validação via `perfis.json` no GitHub
- Módulos: Contas a Receber, Contas a Pagar, Fluxo de Caixa, DRE
- Gerenciamento de clientes com sincronização direta via token GitHub
- Dashboard do cliente com navegação entre módulos
- Filtro por mês em todos os módulos de relatório
