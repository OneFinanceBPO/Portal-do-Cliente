import { redirect } from 'next/navigation';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { getEmpresaIdAtual } from '@/lib/empresa-atual';
import SyncEmpresaCookie from '@/components/financeiro/sync-empresa-cookie';
import { db } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';

export default async function DashboardPage({ searchParams }: { searchParams: { clienteId?: string } }) {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const clienteId = getEmpresaIdAtual(searchParams.clienteId);
  if (!clienteId || !podeAcessarCliente(sessao, clienteId)) redirect('/clientes');

  const empresa = await db.empresa.findUnique({ where: { id: clienteId } });
  if (!empresa) redirect('/clientes');

  return (
    <div className="home-page">
      <SyncEmpresaCookie clienteId={clienteId} />
      <div className="home-left">
        <div className="home-brand">
          <div className="home-logo"><Image src="/logo.png" alt="One Finance" width={72} height={72} /></div>
          <h1>Dashboard <span>Financeiro</span></h1>
          <p>Selecione um módulo para visualizar os dados financeiros da sua empresa integrados via Conta Azul.</p>
        </div>
      </div>

      <div className="home-right">
        <div className="home-modules">
          <div className="home-top">
            <div>
              <div className="home-welcome">Olá, <span>{empresa.nome}</span></div>
              <div className="home-sub">Escolha um módulo para continuar</div>
            </div>
          </div>

          <div className="mod-list">
            <Link href={`/contas-receber?clienteId=${empresa.id}`} className="mod-item">
              <div className="mod-num">1</div>
              <div className="mod-info">
                <div className="mod-name">Contas a Receber</div>
                <div className="mod-desc">Recebíveis, vencimentos e status de cobranças</div>
              </div>
            </Link>
            <Link href={`/contas-pagar?clienteId=${empresa.id}`} className="mod-item">
              <div className="mod-num">2</div>
              <div className="mod-info">
                <div className="mod-name">Contas a Pagar</div>
                <div className="mod-desc">Pagamentos, vencimentos e categorias de despesas</div>
              </div>
            </Link>
            <Link href={`/fluxo-caixa?clienteId=${empresa.id}`} className="mod-item">
              <div className="mod-num">3</div>
              <div className="mod-info">
                <div className="mod-name">Fluxo de Caixa</div>
                <div className="mod-desc">Entradas, saídas e saldo do período</div>
              </div>
            </Link>
            <Link href={`/dre?clienteId=${empresa.id}`} className="mod-item">
              <div className="mod-num">4</div>
              <div className="mod-info">
                <div className="mod-name">DRE</div>
                <div className="mod-desc">Demonstrativo de Resultado Gerencial</div>
              </div>
            </Link>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/clientes" style={{ fontSize: '11px', color: 'var(--text2)' }}>← Voltar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}