import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import NovoClienteForm from './novo-cliente-form';

export default async function ClientesPage() {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');
  if (sessao.role !== 'ADMIN') redirect('/dashboard');

  const empresas = await db.empresa.findMany({ orderBy: { nome: 'asc' } });

  return (
    <main className="page">
      <div className="sec-header">
        <div className="sec-title">Gerenciamento de clientes</div>
      </div>

      <NovoClienteForm />

      <div className="clients-grid" style={{ marginTop: '20px' }}>
        {empresas.map((e) => (
          <div key={e.id} className="client-card">
            <div className="client-icon">🏢</div>
            <div className="client-info">
              <div className="client-name">{e.nome}</div>
              <div className="client-meta">CNPJ {e.cnpj} · {e.ativo ? 'Ativo' : 'Inativo'}</div>
            </div>
          </div>
        ))}
        {empresas.length === 0 && <p style={{ color: 'var(--text2)' }}>Nenhum cliente cadastrado.</p>}
      </div>
    </main>
  );
}