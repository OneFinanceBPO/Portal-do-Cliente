import { redirect } from 'next/navigation';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { getEmpresaIdAtual } from '@/lib/empresa-atual';
import SyncEmpresaCookie from '@/components/financeiro/sync-empresa-cookie';
import DreClient from './dre-client';

export default async function DrePage({ searchParams }: { searchParams: { clienteId?: string } }) {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const clienteId = getEmpresaIdAtual(searchParams.clienteId);
  if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/dashboard');

  return (
    <>
      <SyncEmpresaCookie clienteId={clienteId} />
      <DreClient clienteId={clienteId} />
    </>
  );
}