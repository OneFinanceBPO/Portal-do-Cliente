import { redirect } from 'next/navigation';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { getEmpresaIdAtual } from '@/lib/empresa-atual';
import { getDadosFinanceiro } from '@/lib/financeiro';
import SyncEmpresaCookie from '@/components/financeiro/sync-empresa-cookie';
import ContasReceberClient from './contas-receber-client';

export default async function ContasReceberPage({ searchParams }: { searchParams: { clienteId?: string } }) {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const clienteId = getEmpresaIdAtual(searchParams.clienteId);
  if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/dashboard');

  const ano = new Date().getFullYear();
  const dadosIniciais = await getDadosFinanceiro(clienteId, ano, null);

  return (
    <>
      <SyncEmpresaCookie clienteId={clienteId} />
      <ContasReceberClient clienteId={clienteId} anoInicial={ano} dadosIniciais={dadosIniciais} />
    </>
  );
}