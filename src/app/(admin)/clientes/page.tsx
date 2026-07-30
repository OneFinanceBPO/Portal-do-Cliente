import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import ClientesClient from './clientes-client';

export default async function ClientesPage() {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const empresas = await db.empresa.findMany({
    where: sessao.role === 'ADMIN' ? {} : { acessos: { some: { usuarioId: sessao.id } } },
    orderBy: { nome: 'asc' },
  });

  return <ClientesClient empresas={empresas} isAdmin={sessao.role === 'ADMIN'} />;
} 