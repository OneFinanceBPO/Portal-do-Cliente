"""
Módulo de envio do relatório de execução por e-mail.
"""

import os
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

log = logging.getLogger(__name__)

EMAIL_DESTINO   = os.getenv("EMAIL_DESTINO")
EMAIL_REMETENTE = os.getenv("EMAIL_REMETENTE")
EMAIL_SENHA_APP = os.getenv("EMAIL_SENHA_APP")


def _linha_tabela(d):
    cores = {"ok": "#16a34a", "pulado": "#d97706", "erro": "#dc2626"}
    icones = {"ok": "✅", "pulado": "⚠️", "erro": "❌"}
    cor = cores.get(d["status"], "#6b7280")
    icone = icones.get(d["status"], "•")
    registros = f"{d['registros']} registros" if d["status"] == "ok" else d["motivo"]
    return (
        f'<tr>'
        f'<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">{icone} {d["nome"]}</td>'
        f'<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:12px">{d["cnpj"]}</td>'
        f'<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;color:{cor};font-weight:600">{d["status"].upper()}</td>'
        f'<td style="padding:6px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:12px">{registros}</td>'
        f'</tr>'
    )


def _montar_html(resultado):
    ok      = resultado["ok"]
    erros   = resultado["erros"]
    pulados = resultado["pulados"]
    total   = resultado["total_hub"]
    tempo   = resultado["tempo_total"]
    agora   = datetime.now().strftime("%d/%m/%Y às %H:%M")

    cor_status = "#16a34a" if erros == 0 else "#dc2626"
    linhas = "".join(_linha_tabela(d) for d in resultado["detalhes"])

    return f"""
    <html><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px">
    <div style="max-width:700px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

      <div style="background:#1e3a5f;padding:24px 32px">
        <h1 style="color:#fff;margin:0;font-size:20px">One Finance — Extrato de Movimentações</h1>
        <p style="color:#94a3b8;margin:6px 0 0;font-size:13px">Execução automática · {agora}</p>
      </div>

      <div style="padding:24px 32px">
        <div style="display:flex;gap:16px;margin-bottom:24px">
          <div style="flex:1;background:#f0fdf4;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#16a34a">{ok}</div>
            <div style="font-size:12px;color:#6b7280">OK</div>
          </div>
          <div style="flex:1;background:#fffbeb;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#d97706">{pulados}</div>
            <div style="font-size:12px;color:#6b7280">Pulados</div>
          </div>
          <div style="flex:1;background:#fef2f2;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:28px;font-weight:700;color:#dc2626">{erros}</div>
            <div style="font-size:12px;color:#6b7280">Erros</div>
          </div>
          <div style="flex:1;background:#f8fafc;border-radius:8px;padding:16px;text-align:center">
            <div style="font-size:20px;font-weight:700;color:#334155">{tempo}</div>
            <div style="font-size:12px;color:#6b7280">Tempo total</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f1f5f9">
              <th style="padding:8px 12px;text-align:left;color:#475569">Empresa</th>
              <th style="padding:8px 12px;text-align:left;color:#475569">CNPJ</th>
              <th style="padding:8px 12px;text-align:left;color:#475569">Status</th>
              <th style="padding:8px 12px;text-align:left;color:#475569">Detalhe</th>
            </tr>
          </thead>
          <tbody>{linhas}</tbody>
        </table>
      </div>

      <div style="background:#f8fafc;padding:14px 32px;font-size:11px;color:#94a3b8;text-align:center">
        One Finance BPO Financeiro · Agente automático de extrato
      </div>
    </div>
    </body></html>
    """


def enviar_relatorio(resultado):
    """Envia o relatório de execução por e-mail via Gmail."""
    if not EMAIL_REMETENTE or not EMAIL_SENHA_APP or not EMAIL_DESTINO:
        log.warning("Variáveis de e-mail não configuradas — relatório não enviado")
        return

    try:
        ok    = resultado["ok"]
        total = resultado["total_hub"]
        erros = resultado["erros"]

        if erros > 0:
            assunto = f"⚠️ Extrato atualizado com erros — {ok}/{total} clientes | One Finance"
        else:
            assunto = f"✅ Extrato atualizado — {ok}/{total} clientes | One Finance"

        msg = MIMEMultipart("alternative")
        msg["Subject"] = assunto
        msg["From"]    = EMAIL_REMETENTE
        msg["To"]      = EMAIL_DESTINO
        msg.attach(MIMEText(_montar_html(resultado), "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL_REMETENTE, EMAIL_SENHA_APP)
            smtp.sendmail(EMAIL_REMETENTE, EMAIL_DESTINO, msg.as_string())

        log.info(f"E-mail de relatório enviado para {EMAIL_DESTINO}")

    except Exception as e:
        log.error(f"Falha ao enviar e-mail de relatório: {e}")
