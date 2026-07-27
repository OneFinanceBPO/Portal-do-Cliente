import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 20 * 60 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[DEBUG] credentials recebidos:', JSON.stringify(credentials));

        if (!credentials?.email || !credentials?.senha) {
          console.log('[DEBUG] faltou email ou senha no payload recebido');
          return null;
        }

        const usuario = await db.usuario.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
          include: { acessos: { select: { empresaId: true } } },
        });

        if (!usuario || !usuario.ativo) {
          console.log('[DEBUG] usuario nulo ou inativo:', usuario?.email, usuario?.ativo);
          return null;
        }

        console.log('[DEBUG] hash do banco:', JSON.stringify(usuario.senhaHash), 'tamanho:', usuario.senhaHash.length);

        const senhaOk = await bcrypt.compare(credentials.senha, usuario.senhaHash);
        console.log('[DEBUG] resultado bcrypt.compare:', senhaOk);

        if (!senhaOk) return null;

        await db.usuario.update({
          where: { id: usuario.id },
          data: { ultimoLogin: new Date() },
        });

        await db.logAtividade.create({
          data: {
            usuarioId: usuario.id,
            categoria: 'login',
            acao: 'Login bem-sucedido',
            detalhe: usuario.email,
          },
        });

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          role: usuario.role,
          acessos: usuario.acessos.map((a) => a.empresaId),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.acessos = (user as any).acessos;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).acessos = token.acessos;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};