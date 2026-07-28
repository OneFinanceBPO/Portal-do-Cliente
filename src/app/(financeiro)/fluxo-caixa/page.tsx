import { redirect } from "next/navigation";
import { getSessaoOuNull, podeAcessarCliente } from "@/lib/rbac";
import { getEmpresaIdAtual } from '@/lib/empresa-atual';
import SyncEmpresaCookie from '@/components/financeiro/sync-empresa-cookie';
import TabelaFinanceira from "@/components/tabela-financeira";

export default async function FluxoCaixaPage({ searchParams }: { searchParams: { clienteId?: string } }) {
    const sessao = await getSessaoOuNull();
    if (!sessao) redirect('/login');

    const clienteId = getEmpresaIdAtual(searchParams.clienteId);
    if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/dashboard');

    return (
        <main className="page">
            <SyncEmpresaCookie clienteId={clienteId} />
            <h1>Fluxo de Caixa</h1>
            <TabelaFinanceira clienteId={clienteId} destaque="saldo" />
        </main>
    );
}