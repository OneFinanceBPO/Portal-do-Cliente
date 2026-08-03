'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
    router.push('/clientes');
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <Image src="/logo.png" alt="One Finance" width={72} height={72} />
          </div>
          <h1>Portal do <span>Usuário</span></h1>
          <p>Acesse os dados financeiros da sua empresa com segurança e em tempo real.</p>
        </div>

        <div className="login-feats">
          <div className="login-feat">
            <div className="feat-icon">📊</div>
            Dashboard financeiro completo
          </div>
          <div className="login-feat">
            <div className="feat-icon">🔗</div>
            Dados integrados via Conta Azul
          </div>
          <div className="login-feat">
            <div className="feat-icon">🔒</div>
            Ambiente isolado e seguro por empresa
          </div>
          <div className="login-feat">
            <div className="feat-icon">⏱️</div>
            Atualização em tempo real
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-box">
          <h2>Bem-vindo de volta</h2>
          <p className="sub">Acesse sua conta para continuar</p>

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

            <div className="form-group">
              <label className="form-lbl" htmlFor="senha">Senha</label>
              <div className="form-wrap">
                <input
                  className="form-input"
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
                <span className="input-ico" onClick={() => setMostrarSenha(!mostrarSenha)}>
                  {mostrarSenha ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {erro && (
              <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '14px' }}>{erro}</p>
            )}

            <button type="submit" className="btn btn-primary btn-login" disabled={carregando}>
              {carregando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href="/recuperar-senha" style={{ fontSize: '12px', color: 'var(--text2)' }}>
              Esqueci minha senha
            </a>
          </div>
        </div>
      </div>

      <div className="footer-login">
        <span className="footer-dot"></span>
        One Finance BPO Financeiro &nbsp;·&nbsp; v3.0.0 &nbsp;·&nbsp;
        <a href="/privacidade" style={{ color: 'var(--text3)', marginLeft: '4px' }}>Política de Privacidade</a>
      </div>
    </div>
  );
}