"""
Agendador do agente — roda todo dia às 06h00.
"""

import time
import logging
from datetime import datetime

import schedule
from main import run_agente

log = logging.getLogger(__name__)


def job():
    log.info(f"Iniciando execução agendada: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    run_agente()


schedule.every().day.at("06:00").do(job)

proxima = schedule.next_run()
log.info(f"Agendador iniciado — próxima execução: {proxima.strftime('%d/%m/%Y às %H:%M')}")

while True:
    schedule.run_pending()
    time.sleep(30)
