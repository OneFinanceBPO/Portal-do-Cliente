#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Instala (ou remove) o agendamento diário do Agente de Extrato
# via launchd (macOS nativo).
#
# Uso:
#   bash instalar_agendamento.sh          → instala (roda às 06:00)
#   bash instalar_agendamento.sh remover  → desinstala
#   bash instalar_agendamento.sh status   → mostra estado atual
#   bash instalar_agendamento.sh testar   → roda agora (teste)
# ─────────────────────────────────────────────────────────────

LABEL="com.onefinance.agente-extrato"
PLIST_SRC="$(cd "$(dirname "$0")" && pwd)/${LABEL}.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/${LABEL}.plist"

case "${1:-instalar}" in

  instalar)
    echo "📦 Instalando agendamento diário (06:00)..."
    cp "$PLIST_SRC" "$PLIST_DEST"
    launchctl load "$PLIST_DEST"
    echo "✅ Instalado! O agente rodará todos os dias às 06:00."
    echo "   Logs em: logs/launchd_stdout.log e logs/launchd_stderr.log"
    ;;

  remover)
    echo "🗑  Removendo agendamento..."
    launchctl unload "$PLIST_DEST" 2>/dev/null
    rm -f "$PLIST_DEST"
    echo "✅ Agendamento removido."
    ;;

  status)
    echo "📋 Status do agente:"
    launchctl list | grep "$LABEL" || echo "   (não instalado ou não rodando)"
    echo ""
    echo "Arquivo plist em LaunchAgents:"
    ls -la "$PLIST_DEST" 2>/dev/null || echo "   (não encontrado)"
    ;;

  testar)
    echo "🧪 Rodando o agente agora (teste)..."
    cd "$(dirname "$0")"
    /usr/bin/python3 main.py --sem-email
    ;;

  *)
    echo "Opção inválida: $1"
    echo "Use: instalar | remover | status | testar"
    exit 1
    ;;
esac
