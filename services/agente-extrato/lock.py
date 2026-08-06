

import os
import time

LOCK_FILE = "agente.lock"

LOCK_MAX_IDADE_SEGUNDOS = 15 * 60


def adquirir_lock() -> bool:
   
    if os.path.exists(LOCK_FILE):
        idade = time.time() - os.path.getmtime(LOCK_FILE)
        if idade < LOCK_MAX_IDADE_SEGUNDOS:
            return False
        os.remove(LOCK_FILE)  

    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))
    return True


def liberar_lock() -> None:
    try:
        os.remove(LOCK_FILE)
    except FileNotFoundError:
        pass