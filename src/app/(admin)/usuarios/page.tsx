import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import UsuariosClient from './usuarios-client';

export default async function UsuariosPage() {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');
  if (sessao.role !== 'ADMIN') redirect('/dashboard');

  const [usuarios, empresas] = await Promise.all([
    db.usuario.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, ultimoLogin: true },
      orderBy: { nome: 'asc' },
    }),
    db.empresa.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' },
    }),
  ]);

  return (
    <main className="page">
      <Suspense fallback={null}>
        <UsuariosClient usuarios={usuarios} empresas={empresas} />
      </Suspense>
    </main>
  );
}