# Como rodar o Agente de Extrato — One Finance

## Primeira vez

1. Copie o arquivo de variáveis e preencha:
   ```bash
   cp .env.example .env
   ```
   Abra o `.env` e preencha todas as variáveis.

2. Instale as dependências Python:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

3. Execute as queries SQL no Supabase:
   - Acesse Dashboard → SQL Editor
   - Cole e execute o bloco SQL da **Tarefa 5** do plano de ação

4. Teste com um único cliente:
   ```bash
   python main.py --teste --debug
   ```

---

## Execução manual (uma vez)
```bash
python main.py
```

## Execução agendada (produção — roda todo dia às 06h00)
```bash
python agendador.py
```

## Modo debug (navegador visível para acompanhar)
```bash
python main.py --debug
```

## Rodar apenas um cliente específico
```bash
python main.py --cliente "NOME DA EMPRESA" --debug
```

## Sem envio de e-mail
```bash
python main.py --sem-email
```

---

## Parâmetros disponíveis

| Parâmetro | Descrição |
|-----------|-----------|
| `--debug` | Abre o navegador visível (headless=False) |
| `--teste` | Roda apenas o primeiro cliente encontrado |
| `--cliente NOME` | Filtra pelo nome da empresa (parcial, sem diferença de maiúsculas) |
| `--sem-email` | Não envia e-mail ao final |

---

## Onde ficam os dados

| O quê | Onde |
|-------|------|
| CSVs temporários | `./downloads/` (apagados após processamento) |
| Extrato financeiro | Supabase — tabela `extrato_movimentacoes` |
| Log de execuções | `./logs/execucoes.log` + tabelas `log_execucoes` / `log_clientes` no Supabase |

---

## Hospedagem em produção (recomendações)

| Opção | Custo | Indicado para |
|-------|-------|---------------|
| **Railway.app** | Gratuito até 500h/mês | Início, testes |
| **Render.com** | Gratuito com limitações | Projetos pequenos |
| **VPS DigitalOcean** | ~$6/mês | Produção confiável |

Para VPS, use `pm2` ou `systemd` para manter o agendador rodando 24/7.

---

## Variáveis do .env

| Variável | Descrição |
|----------|-----------|
| `CA_EMAIL` | E-mail de login do Conta Azul Mais (conta BPO) |
| `CA_SENHA` | Senha do Conta Azul Mais |
| `SUPABASE_URL` | URL do projeto Supabase (ex: `https://xxx.supabase.co`) |
| `SUPABASE_KEY` | Chave `service_role` do Supabase (não a `anon`) |
| `EMAIL_DESTINO` | E-mail que recebe o relatório diário |
| `EMAIL_REMETENTE` | E-mail Gmail que envia o relatório |
| `EMAIL_SENHA_APP` | Senha de app do Gmail (não a senha normal) |

> **Atenção:** Para a `SUPABASE_KEY`, use a chave `service_role` (encontrada em Settings → API no Supabase).  
> Para o Gmail, ative a autenticação em 2 fatores e gere uma "Senha de app" em myaccount.google.com/apppasswords.
