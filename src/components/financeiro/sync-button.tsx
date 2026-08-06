'use client';

import { useEffect, useRef, useState } from 'react';

type StatusSync = 'idle' | 'pendente' | 'em_andamento' | 'concluido' | 'erro';

type Solicitacao = {
  id: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'erro';
  mensagem: string | null;
  registrosSalvos: number | null;
  solicitadoEm: string;
};

function lerCookieEmpresaAtual(): string | null {
  const m = document.cookie.match(/(?:^|; )empresaAtual=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const INTERVALO_POLL_MS = 4000;
const TIMEOUT_POLL_MS = 5 * 60 * 1000;

export default function SyncButton() {
  const [status, setStatus] = useState<StatusSync>('idle');
  const [mensagem, setMensagem] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inicioPollRef = useRef<number>(0);

  function pararPoll() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function consultarStatus(empresaId: string) {
    try {
      const r = await fetch(`/api/v1/sync?clienteId=${empresaId}`);
      if (!r.ok) return;
      const s: Solicitacao | null = await r.json();
      if (!s) return;

      if (s.status === 'pendente' || s.status === 'em_andamento') {
        setStatus(s.status);
        if (Date.now() - inicioPollRef.current > TIMEOUT_POLL_MS) {
          pararPoll();
          setStatus('idle');
          setMensagem('A sincronização está demorando mais que o esperado — verifique se o agente está rodando.');
        }
        return;
      }

      pararPoll();
      setStatus(s.status === 'erro' ? 'erro' : 'concluido');
      setMensagem(s.mensagem ?? (s.status === 'concluido' ? `${s.registrosSalvos ?? 0} registro(s) atualizados` : null));
      
      setTimeout(() => setStatus('idle'), 6000);
    } catch {
     
    }
  }

  useEffect(() => {
   
    const empresaId = lerCookieEmpresaAtual();
    if (!empresaId) return;
    consultarStatus(empresaId);
    return () => pararPoll();
    
  }, []);

  async function handleClick() {
    if (status === 'pendente' || status === 'em_andamento') return; // já em andamento

    const empresaId = lerCookieEmpresaAtual();
    if (!empresaId) {
      setStatus('erro');
      setMensagem('Não foi possível identificar a empresa atual.');
      setTimeout(() => setStatus('idle'), 4000);
      return;
    }

    setStatus('pendente');
    setMensagem(null);
    try {
      const r = await fetch('/api/v1/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: empresaId }),
      });
      if (!r.ok) throw new Error('Falha ao solicitar sincronização');

      inicioPollRef.current = Date.now();
      pararPoll();
      pollRef.current = setInterval(() => consultarStatus(empresaId), INTERVALO_POLL_MS);
    } catch {
      setStatus('erro');
      setMensagem('Não foi possível solicitar a sincronização.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  }

  const classeExtra =
    status === 'pendente' || status === 'em_andamento' ? 'sync-syncing' : status === 'concluido' ? 'sync-ok' : status === 'erro' ? 'sync-erro' : '';

  const titulo =
    status === 'pendente'
      ? 'Sincronização solicitada — aguardando o agente pegar a fila'
      : status === 'em_andamento'
      ? 'Sincronizando com o Conta Azul…'
      : status === 'concluido'
      ? mensagem ?? 'Sincronização concluída'
      : status === 'erro'
      ? mensagem ?? 'Erro na sincronização'
      : 'Sincronizar com o Conta Azul';

  return (
    <button className={`icon-btn ${classeExtra}`} onClick={handleClick} title={titulo} disabled={status === 'pendente' || status === 'em_andamento'}>
      {status === 'concluido' ? (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : status === 'erro' ? (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      )}
    </button>
  );
}