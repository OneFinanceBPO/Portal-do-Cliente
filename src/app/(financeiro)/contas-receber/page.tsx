import { redirect } from 'next/navigation';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { getEmpresaIdAtual } from '@/lib/empresa-atual';
import SyncEmpresaCookie from '@/components/financeiro/sync-empresa-cookie';
import ContasReceberClient from './contas-receber-client';

export default async function ContasReceberPage({ searchParams }: { searchParams: { clienteId?: string } }) {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const clienteId = searchParams.clienteId;
  if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/dashboard');

  return (
    <>
      <SyncEmpresaCookie clienteId={clienteId} />
      <ContasReceberClient clienteId={clienteId} />
    </>
  );
}