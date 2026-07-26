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
    <main>
      <h1>Gerenciamento de clientes</h1>

      <NovoClienteForm />

      <table>
        <thead>
          <tr><th>Nome</th><th>CNPJ</th><th>Status</th></tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.id}>
              <td>{e.nome}</td>
              <td>{e.cnpj}</td>
              <td>{e.ativo ? 'Ativo' : 'Inativo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}