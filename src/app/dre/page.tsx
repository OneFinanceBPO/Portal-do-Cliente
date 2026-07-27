import { redirect } from "next/navigation";
import { getSessaoOuNull, podeAcessarCliente } from "@/lib/rbac";
import TabelaFinanceira from "@/components/tabela-financeira";

export default async function DrePage({ searchParams }: { searchParams: { clienteId?: string } }) {
    const sessao = await getSessaoOuNull();
    if (!sessao) redirect('/login');

    const clienteId = searchParams.clienteId;
    if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/dashboard');

    return (
        <main className="page">
            <h1>DRE — Demonstrativo de Resultado</h1>
            <TabelaFinanceira clienteId={clienteId} destaque="saldo" />
        </main>
    );
}