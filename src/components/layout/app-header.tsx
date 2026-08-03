'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MenuUsuario from '@/components/menu-usuario';

const TITULOS: Record<string, string> = {
  '/contas-receber': 'Contas a Receber',
  '/contas-pagar': 'Contas a Pagar',
  '/fluxo-caixa': 'Fluxo de Caixa',
  '/dre': 'DRE — Demonstrativo de Resultado Gerencial',
};

export default function AppHeader({ titulo, nomeUsuario }: { titulo?: string; nomeUsuario: string }) {
  const pathname = usePathname();
  const [hora, setHora] = useState('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      setHora(now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  function toggleFull() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  const tituloFinal = titulo ?? TITULOS[pathname] ?? 'Financeiro';

  return (
    <header className="header">
      <div className="header-left">
        <Link href="/clientes" className="icon-btn" title="Voltar para lista de clientes">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="divider-v"></div>
        <span className="logo-text">One <span>Finance</span></span>
        <div className="divider-v"></div>
        <span className="page-title">{tituloFinal}</span>
      </div>
      <div className="header-right">
        <div className="time-badge">
          <span className="lbl">Última atualização</span>
          <span>{hora}</span>
        </div>
        <button className="icon-btn" onClick={toggleFull} title="Tela cheia">⛶</button>
        <MenuUsuario nome={nomeUsuario} />
      </div>
    </header>
  );
}