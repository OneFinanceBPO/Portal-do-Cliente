import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';

export default async function RootPage() {
  const sessao = await getSessaoOuNull();

  if (!sessao) {
    redirect('/login');
  }

  redirect('/clientes');
}