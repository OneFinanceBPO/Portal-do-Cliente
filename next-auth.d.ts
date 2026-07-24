import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: 'ADMIN' | 'USER' | 'CLIENTE';
            acessos: string[];
        } & DefaultSession['user'];
    }
}