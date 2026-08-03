'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Empresa = { id: string; nome: string };

export default function ModalPerfil({ empresas, onClose }: { empresas: Empresa[]; onClose: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [role, setRole] = useState<'ADMIN' | 'LIMITADO'>('LIMITADO');
  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const regras = [
    { label: '8+ caracteres', ok: senha.length >= 8 },
    { label: 'Maiúscula', ok: /[A-Z]/.test(senha) },
    { label: 'Número', ok: /[0-9]/.test(senha) },
    { label: 'Especial (!@#$%)', ok: /[!@#$%^&*(),.?":{}|<>]/.test(senha) },
  ];
  const senhaForte = regras.every((r) => r.ok);

  function toggleEmpresa(id: string) {
    setEmpresasSelecionadas((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (!senhaForte) {
      setErro('A senha não atende a todos os requisitos.');
      return;
    }

    setCarregando(true);
    const res = await fetch('/api/v1/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: `${nome} ${sobrenome}`.trim(),
        email,
        senha,
        role,
        clienteIds: empresasSelecionadas,
      }),
    });

    setCarregando(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(typeof data.error === 'string' ? data.error : 'Não foi possível salvar o perfil.');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Novo Perfil</h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-lbl" htmlFor="nome">Nome</label>
            <div className="form-wrap"><input className="form-input" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-lbl" htmlFor="sobrenome">Sobrenome</label>
            <div className="form-wrap"><input className="form-input" id="sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} required /></div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-lbl" htmlFor="email">E-mail para login</label>
          <div className="form-wrap">
            <input className="form-input" id="email" type="email" placeholder="seu@email.com.br" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label className="form-lbl" htmlFor="senha">Senha</label>
          <div className="form-wrap">
            <input
              className="form-input"
              id="senha"
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
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
          <label className="form-lbl" htmlFor="role">Tipo de acesso</label>
          <div className="form-wrap">
            <select className="filter-sel" id="role" value={role} onChange={(e) => setRole(e.target.value as 'ADMIN' | 'LIMITADO')} style={{ width: '100%' }}>
              <option value="ADMIN">Administrador — acesso total ao sistema</option>
              <option value="LIMITADO">Limitado — acesso restrito às empresas selecionadas</option>
            </select>
          </div>
        </div>

        {role === 'LIMITADO' && (
          <div className="form-group">
            <label className="form-lbl">Empresas com acesso</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {empresas.map((emp) => (
                <label key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={empresasSelecionadas.includes(emp.id)}
                    onChange={() => toggleEmpresa(emp.id)}
                  />
                  {emp.nome}
                </label>
              ))}
              {empresas.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Nenhuma empresa cadastrada.</span>}
            </div>
          </div>
        )}

        {erro && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}>{erro}</p>}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Voltar</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={carregando}>
            {carregando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}