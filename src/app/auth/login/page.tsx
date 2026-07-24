'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        const result = await signIn('credentials', { email, senha, redirect: false });

        setCarregando(false);
        if (result?.error) {
            setErro('E-mail ou senha inválidos');
            return;
        }
        router.push('/dashboard');
    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <h1>Portal do Usuário</h1>
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label htmlFor="senha">Senha</label>
                <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                {erro && <p role="alert">{erro}</p>}
                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando…' : 'Entrar'}
                </button>
            </form>
        </main>
    );
}