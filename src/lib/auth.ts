import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import bycrypt from 'bcryptjs';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt', maxAge: 20 * 60 },
    pages: { signIn: '/login' },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'Enter your email' },
                password: { label: 'password', type: 'password', placeholder: 'Enter your password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await db.user.findUnique({
                    where: { email: credentials.email.trim().toLowerCase() },
                    include: { acessos: { select: { clienteId: true } } },
                });

                if (!user || !user.active) return null;

                const passwordOk = await bycrypt.compare(credentials.password, user.passwordHash);
                if (!passwordOk) return null;

                await db.user.update({
                    where: { id: user.id },
                    data: { ultimoLogin: new Date() },
                });

                await db.logAtividade.create({
                    data: {
                        userId: user.id,
                        categoria: 'login',
                        acao: 'Login bem-sucedido',
                        datelhe: user.email,
                    },
                });

                return {
                    id: user.id,
                    name: user.nome,
                    email: user.email,
                    role: user.role,
                    acessos: user.acessos.map((a) => a.clienteId),
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