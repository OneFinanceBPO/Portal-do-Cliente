import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';

export default async function UsuariosPage() {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');
  if (sessao.role !== 'ADMIN') redirect('/dashboard');

  const usuarios = await db.usuario.findMany({
    select: { id: true, nome: true, email: true, role: true, ativo: true, ultimoLogin: true },
    orderBy: { nome: 'asc' },
  });

  return (
    <main className="page">
      <div className="sec-header">
        <div className="sec-title">Usuários</div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Status</th><th>Último login</th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'up' : 'neutral'}`}>
                    {u.role === 'ADMIN' ? 'Administrador' : 'Limitado'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.ativo ? 'up' : 'down'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td className="td-neu">{u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}