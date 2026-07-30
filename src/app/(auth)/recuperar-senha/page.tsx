'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperarSenhaPage() {
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            await fetch('/api/v1/auth/recuperar-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setEnviado(true);
        } catch {
            setErro('Não foi possível enviar. Tente novamente em instantes.');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <div className="login-page">
            <div className="login-right" style={{ width: '100%' }}>
                <div className="login-box">
                    <h2>Recuperar senha</h2>
                    <p className="sub">Informe o e-mail cadastrado para receber o link de redefinição</p>

                    {enviado ? (
                        <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
                            Se este e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.
                            Confira também a caixa de spam.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-lbl" htmlFor="email">E-mail</label>
                                <div className="form-wrap">
                                    <input
                                        className="form-input"
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com.br"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {erro && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '14px' }}>{erro}</p>}

                            <button type="submit" className="btn btn-primary btn-login" disabled={carregando}>
                                {carregando ? 'Enviando…' : 'Enviar link de redefinição'}
                            </button>
                        </form>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <Link href="/login" style={{ fontSize: '12px', color: 'var(--text2)' }}>← Voltar para o login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}