import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const role = (req.nextauth.token as any)?.role;

        const rotasAdmin = ['/clientes', '/usuarios', '/api/v1/usuarios', '/api/v1/log']
        if (rotasAdmin.some((r) => pathname.startsWith(r)) && role !== 'ADMIN') {
            return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/clientes/:path*', '/usuarios/:path*', '/perfil/:path*', '/api/v1/:path*'],
};
