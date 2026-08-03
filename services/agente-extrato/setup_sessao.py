"""
Setup de sessão — One Finance
Execute este script UMA VEZ para fazer login no Conta Azul com 2FA.
A sessão ficará salva em session.json e o agente a usará automaticamente.
"""

import os
import json
from datetime import datetime
from playwright.sync_api import sync_playwright

SESSION_FILE = "session.json"


def main():
    print("=" * 50)
    print("  Setup de Sessão — Conta Azul Mais")
    print("=" * 50)
    print()
    print("O navegador vai abrir. Faça login normalmente:")
    print("  1. Digite seu e-mail")
    print("  2. Digite sua senha")
    print("  3. Informe o código do Authenticator")
    print()
    print("Após entrar no hub, volte aqui e pressione ENTER.")
    print()

    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    page.goto("https://mais.contaazul.com/#/login")
    print("Aguardando você fazer login e chegar no hub...")
    print("(O script salva automaticamente quando detectar o hub)")
    print()

    # Aguarda até 5 minutos pelo hub (tempo suficiente para 2FA)
    page.wait_for_url(
        lambda url: "mais.contaazul.com" in url and "/login" not in url,
        timeout=300_000,
    )
    print("Hub detectado! Salvando sessão...")

    # Salva a sessão (cookies + localStorage)
    context.storage_state(path=SESSION_FILE)

    # Registra a data de criação da sessão
    meta = {"criado_em": datetime.now().isoformat(), "url_atual": page.url}
    with open("session_meta.json", "w") as f:
        json.dump(meta, f, indent=2)

    print()
    print(f"✅ Sessão salva em '{SESSION_FILE}'")
    print(f"   URL capturada: {page.url}")
    print()
    print("O agente usará essa sessão automaticamente.")
    print("Rode este script novamente quando o agente começar a pedir login.")
    print()

    browser.close()
    playwright.stop()


if __name__ == "__main__":
    main()
