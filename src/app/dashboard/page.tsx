import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import Image from 'next/image';
import MenuUsuario from '@/components/menu-usuario';

export default async function DashboardPage() {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const usuario = await db.usuario.findUniqueOrThrow({ where: { id: sessao.id } });

  const empresas = await db.empresa.findMany({
    where: sessao.role === 'ADMIN' ? {} : { acessos: { some: { usuarioId: sessao.id } } },
    orderBy: { nome: 'asc' },
  });

  return (
    <div className="home-page">
      <div className="home-left">
        <div className="home-brand">
          <div className="home-logo">
            <Image src="/logo.png" alt="One Finance" width={72} height={72} />
          </div>
          <h1>Dashboard <span>Financeiro</span></h1>
          <p>Selecione uma empresa para visualizar os dados financeiros integrados via Conta Azul.</p>
        </div>
      </div>

      <div className="home-right">
        <div className="home-modules">
          <div className="home-top">
            <div>
              <div className="home-welcome">Olá, <span>{usuario.nome}</span></div>
              <div className="home-sub">Escolha uma empresa para continuar</div>
            </div>
            <MenuUsuario nome={usuario.nome} />
          </div>

          <div className="mod-list">
            {empresas.map((e, i) => (
              <div key={e.id} className="mod-item" style={{ flexDirection: 'column', alignItems: 'stretch', cursor: 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="mod-num">{i + 1}</div>
                  <div className="mod-info">
                    <div className="mod-name">{e.nome}</div>
                    <div className="mod-desc">CNPJ {e.cnpj}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <a href={`/contas-receber?clienteId=${e.id}`} className="btn btn-ghost btn-sm">Contas a Receber</a>
                  <a href={`/contas-pagar?clienteId=${e.id}`} className="btn btn-ghost btn-sm">Contas a Pagar</a>
                  <a href={`/fluxo-caixa?clienteId=${e.id}`} className="btn btn-ghost btn-sm">Fluxo de Caixa</a>
                  <a href={`/dre?clienteId=${e.id}`} className="btn btn-ghost btn-sm">DRE</a>
                </div>
              </div>
            ))}
            {empresas.length === 0 && <p style={{ color: 'var(--text2)' }}>Nenhuma empresa disponível.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}