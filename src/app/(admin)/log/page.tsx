import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import ExportarCsvButton from './exportar-csv-button';

const CATEGORIAS = ['Login', 'Clientes', 'Perfis', 'Segurança'] as const;

export default async function LogPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');
  if (sessao.role !== 'ADMIN') redirect('/dashboard');

  const categoria = searchParams.categoria;

  const logs = await db.logAtividade.findMany({
    where: categoria ? { categoria } : undefined,
    include: { usuario: { select: { nome: true, email: true } } },
    orderBy: { criadoEm: 'desc' },
    take: 200,
  });

  return (
    <main className="page">
      <div className="sec-header">
        <div className="sec-title">Log de atividades</div>
        <ExportarCsvButton />
      </div>

      <div className="filter-row">
        <a 
          href="/log" 
          className={`tog ${!categoria ? 'on' : ''}`} 
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          Todas
        </a>
        
        {CATEGORIAS.map((c) => (
          <a
            key={c}
            href={`/log?categoria=${c}`}
            className={`tog ${categoria === c ? 'on' : ''}`}
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            {c}
          </a>
        ))}
      </div>

      <div className="tbl-wrap log-table">
        <table>
          <thead>
            <tr>
              <th>Data/hora</th>
              <th>Usuário</th>
              <th>Categoria</th>
              <th>Ação</th>
              <th>Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.criadoEm).toLocaleString('pt-BR')}</td>
                <td>{log.usuario ? `${log.usuario.nome} (${log.usuario.email})` : '—'}</td>
                <td><span className="badge neutral">{log.categoria}</span></td>
                <td>{log.acao}</td>
                <td className="td-neu">{log.detalhe ?? '—'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhum registro encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}