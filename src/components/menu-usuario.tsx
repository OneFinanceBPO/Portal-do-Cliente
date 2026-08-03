'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function MenuUsuario({ nome }: { nome: string }) {
  const [aberto, setAberto] = useState(false);

  const iniciais = nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  async function handleSair() {
    // Registra o evento no nosso log antes do NextAuth limpar a sessão
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    await signOut({ callbackUrl: '/login' });
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="avatar" onClick={() => setAberto(!aberto)}>
        {iniciais}
      </div>

      {aberto && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '42px',
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '6px',
            minWidth: '160px',
            boxShadow: '0 12px 32px rgba(0,0,0,.5)',
            zIndex: 300,
          }}
        >
          <Link
            href="/perfil"
            style={{ display: 'block', padding: '8px 12px', fontSize: '13px', borderRadius: '6px' }}
            onClick={() => setAberto(false)}
          >
            Meu Perfil
          </Link>
          <button
            onClick={handleSair}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
              fontSize: '13px', borderRadius: '6px', background: 'none', border: 'none',
              color: 'var(--red)', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}