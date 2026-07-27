'use client';

import { useEffect, useState } from 'react';
import MenuUsuario from '@/components/menu-usuario';

export default function AppHeader({ titulo, nomeUsuario }: { titulo: string; nomeUsuario: string }) {
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

  return (
    <header className="header">
      <div className="header-left">
        <span className="logo-text">One <span>Finance</span></span>
        <div className="divider-v"></div>
        <span className="page-title">{titulo}</span>
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