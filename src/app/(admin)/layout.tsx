import AdminSidebar from '@/components/layout/admin-sidebar';
import AppHeader from '@/components/layout/app-header';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const usuario = await db.usuario.findUniqueOrThrow({ where: { id: sessao.id } });

  return (
    <>
      <AdminSidebar isAdmin={sessao.role === 'ADMIN'} />
      <AppHeader titulo="Gerenciamento" nomeUsuario={usuario.nome} />
      <main className="main">{children}</main>
      <div className="footer">
        <div className="footer-dot"></div>
        One Finance BPO Financeiro
      </div>
    </>
  );
}