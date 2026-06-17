"""
Agendador do Agente de Extrato — One Finance BPO Financeiro

O agendamento é feito via launchd (macOS nativo), NÃO por este arquivo.
O launchd roda às 06:00 todos os dias, sobrevive a reboot e não precisa
de terminal aberto.

Para instalar/gerenciar o agendamento automático:
    bash instalar_agendamento.sh          → instala (06:00 diário)
    bash instalar_agendamento.sh remover  → desinstala
    bash instalar_agendamento.sh status   → verifica se está ativo
    bash instalar_agendamento.sh testar   → roda agora (teste manual)

Para rodar manualmente:
    python3 main.py --sem-email
    python3 main.py --sem-email --debug   (abre o navegador visível)
    python3 main.py --sem-email --teste   (processa apenas 1 cliente)
"""

if __name__ == "__main__":
    print(__doc__)
