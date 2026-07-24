import { getServerSession } from 'next-auth';
import { AuthOptions } from '@/lib/auth';

export type SessaoUsuario = {
    id: string;
    role: 'ADMIN' | 'USER' | 'CLIENTE';
    acessos: string[];
};

export async function getSessaoOuNull(): Promise<SessaoUsuario | null> {
    const session = await getServerSession(AuthOptions);
    if (!session?.user) return null;
    const user = session.user as any;
    return { id: user.id, role: user.role, acessos: user.acessos ?? [] };
}

export function podeAcessarCliente(sessao: SessaoUsuario, clienteId: string): boolean {
    if (sessao.role === 'ADMIN') return true;
    return sessao.acessos.includes(clienteId);
}