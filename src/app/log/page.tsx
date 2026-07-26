import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';

const CATEGORIAS = ['login', 'clientes', 'perfis', 'seguranca'] as const;

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
    <main>
      <h1>Log de atividades</h1>

      <nav>
        <a href="/log">Todas</a>
        {CATEGORIAS.map((c) => (
          <a key={c} href={`/log?categoria=${c}`}>{c}</a>
        ))}
      </nav>

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
              <td>{log.categoria}</td>
              <td>{log.acao}</td>
              <td>{log.detalhe ?? '—'}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={5}>Nenhum registro encontrado.</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}