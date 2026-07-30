'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RedefinirSenhaForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const regras = [
        { label: '8+ caracteres', ok: novaSenha.length >= 8 },
        { label: 'Maiúscula', ok: /[A-Z]/.test(novaSenha) },
        { label: 'Número', ok: /[0-9]/.test(novaSenha) },
        { label: 'Especial (!@#$%)', ok: /[!@#$%^&*(),.?":{}|<>]/.test(novaSenha) },
    ];
    const senhaForte = regras.every((r) => r.ok);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro('');

        if (!token) {
            setErro('Link inválido: token não encontrado na URL.');
            return;
        }
        if (!senhaForte) {
            setErro('A senha não atende a todos os requisitos.');
            return;
        }
        if (novaSenha !== confirmacao) {
            setErro('As senhas não coincidem.');
            return;
        }

        setCarregando(true);
        const res = await fetch('/api/v1/auth/redefinir-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, novaSenha }),
        });
        const data = await res.json();
        setCarregando(false);

        if (!res.ok) {
            setErro(data.error ?? 'Não foi possível redefinir a senha.');
            return;
        }

        setSucesso(true);
        setTimeout(() => router.push('/login'), 2500);
    }

    if (!token) {
        return (
            <p style={{ fontSize: '13px', color: 'var(--red)' }}>
                Link inválido ou incompleto. Solicite uma nova recuperação de senha na tela de login.
            </p>
        );
    }

    if (sucesso) {
        return <p style={{ fontSize: '13px' }}>Senha redefinida com sucesso! Redirecionando para o login…</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-lbl" htmlFor="novaSenha">Nova senha</label>
                <div className="form-wrap">
                    <input
                        className="form-input"
                        id="novaSenha"
                        type={mostrarSenha ? 'text' : 'password'}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        required
                    />
                    <span className="input-ico" onClick={() => setMostrarSenha(!mostrarSenha)} style={{ cursor: 'pointer' }}>
                        {mostrarSenha ? '🙈' : '👁️'}
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '8px' }}>
                    {regras.map((r) => (
                        <span key={r.label} style={{ fontSize: '11px', color: r.ok ? 'var(--green, #22c55e)' : 'var(--text3)' }}>
                            {r.ok ? '✓' : '✕'} {r.label}
                        </span>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-lbl" htmlFor="confirmacao">Confirmar senha</label>
                <div className="form-wrap">
                    <input
                        className="form-input"
                        id="confirmacao"
                        type={mostrarSenha ? 'text' : 'password'}
                        value={confirmacao}
                        onChange={(e) => setConfirmacao(e.target.value)}
                        required
                    />
                </div>
            </div>

            {erro && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '14px' }}>{erro}</p>}

            <button type="submit" className="btn btn-primary btn-login" disabled={carregando}>
                {carregando ? 'Salvando…' : 'Redefinir senha'}
            </button>
        </form>
    );
}

export default function RedefinirSenhaPage() {
    return (
        <div className="login-page">
            <div className="login-right" style={{ width: '100%' }}>
                <div className="login-box">
                    <h2>Criar nova senha</h2>
                    <p className="sub">Escolha uma senha forte para sua conta</p>

                    <Suspense fallback={null}>
                        <RedefinirSenhaForm />
                    </Suspense>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Link href="/login" style={{ fontSize: '12px', color: 'var(--text2)' }}>← Voltar para o login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}