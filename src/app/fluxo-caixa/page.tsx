import { redirect } from "next/navigation";
import { getSessaoOuNull, podeAcessarCliente } from "@/lib/rbac";
import TabelaFinanceira from "@/components/tabela-financeira";

export default async function FluxoCaixaPage({ searchParams }: { searchParams: { clienteId?: string } }) {
    const sessao = await getSessaoOuNull();
    if (!sessao) redirect('/login');

    const clienteId = searchParams.clienteId;
    if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/dashboard');

    return (
        <main className="page">
            <h1>Fluxo de Caixa</h1>
            <TabelaFinanceira clienteId={clienteId} destaque="saldo" />
        </main>
    );
}