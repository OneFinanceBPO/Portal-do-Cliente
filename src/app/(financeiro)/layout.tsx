import Sidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/app-header';
import { IconReceber, IconPagar, IconFluxo, IconDre, IconVoltar } from '@/components/layout/financeiro-icons';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
    const sessao = await getSessaoOuNull();
    if (!sessao) redirect('/login');

    const usuario = await db.usuario.findUniqueOrThrow({ where: { id: sessao.id } });

    const items = [
        { href: '/contas-receber', label: 'A Receber', icon: IconReceber },
        { href: '/contas-pagar', label: 'A Pagar', icon: IconPagar },
        { href: '/fluxo-caixa', label: 'Fluxo de Caixa', icon: IconFluxo },
        { href: '/dre', label: 'DRE', icon: IconDre },
    ];
    const bottomItems = [{ href: '/dashboard', label: 'Voltar', icon: IconVoltar }];

    return (
        <>
            <Sidebar items={items} bottomItems={bottomItems} />
            <AppHeader titulo="Financeiro" nomeUsuario={usuario.nome} mostrarSync />
            <main className="main">{children}</main>
            <div className="footer">
                <div className="footer-dot"></div>
                One Finance BPO Financeiro
            </div>
        </>
    );
}