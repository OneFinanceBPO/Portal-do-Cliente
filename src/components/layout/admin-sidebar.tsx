'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { IconClientes, IconPerfil, IconAtividade, IconSair, IconNovoUsuario } from './admin-icons';

export default function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const itemClass = (href: string) => `nav-btn ${pathname === href ? 'active' : ''}`;

  async function handleSair() {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <aside className="sidebar" id="mainSidebar">
      <div className="brand">
        <Link href="/clientes"><img src="/logo.png" alt="One Finance" /></Link>
      </div>
      <nav>

        <Link href="/clientes">
          <button className={itemClass('/clientes')} title="Clientes">
            {IconClientes}
            <span className="nav-tooltip">Clientes</span>
          </button>
        </Link>
        <Link href="/perfil">
          <button className={itemClass('/perfil')} title="Perfil">
            {IconPerfil}
            <span className="nav-tooltip">Perfil</span>
          </button>
        </Link>
        {isAdmin && (
          <Link href="/log">
            <button className={itemClass('/log')} title="Atividade">
              {IconAtividade}
              <span className="nav-tooltip">Atividade</span>
            </button>
          </Link>
        )}
        {isAdmin && (
          <Link href="/usuarios?novo=1">
            <button className="nav-btn" title="Novo Perfil">
              {IconNovoUsuario}
              <span className="nav-tooltip">Novo Perfil</span>
            </button>
          </Link>
        )}
      </nav>
      <div className="bottom-nav">
        <button className="nav-btn" title="Sair" onClick={handleSair}>
          {IconSair}
          <span className="nav-tooltip">Sair</span>
        </button>
      </div>
    </aside>
  );
}