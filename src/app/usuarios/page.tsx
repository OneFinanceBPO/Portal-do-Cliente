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
        <main>
            <h1>Usuários</h1>
            <table>
                <thead>
                    <tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Status</th><th>Último login</th></tr>
                </thead>
                <tbody>
                    {usuarios.map((u) => (
                        <tr key={u.id}>
                            <td>{u.nome}</td>
                            <td>{u.email}</td>
                            <td>{u.role === 'ADMIN' ? 'Administrador' : 'Limitado'}</td>
                            <td>{u.ativo ? 'Ativo' : 'Inativo'}</td>
                            <td>{u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}