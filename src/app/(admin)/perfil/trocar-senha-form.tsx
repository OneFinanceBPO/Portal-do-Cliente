'use client';

import { useState } from 'react';

export default function TrocarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setMensagem(''); setCarregando(true);

    const res = await fetch('/api/v1/usuarios/senha', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });

    setCarregando(false);
    const data = await res.json();
    if (!res.ok) { setErro(data.error); return; }
    setMensagem(data.message);
    setSenhaAtual(''); setNovaSenha('');
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Trocar senha</h2>

      <div className="form-group">
        <label className="form-lbl" htmlFor="senhaAtual">Senha atual</label>
        <div className="form-wrap">
          <input className="form-input" id="senhaAtual" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-lbl" htmlFor="novaSenha">Nova senha</label>
        <div className="form-wrap">
          <input className="form-input" id="novaSenha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} minLength={8} required />
        </div>
      </div>

      {erro && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}>{erro}</p>}
      {mensagem && <p style={{ color: 'var(--green)', fontSize: '12px', marginBottom: '12px' }}>{mensagem}</p>}
      <button type="submit" className="btn btn-primary" disabled={carregando}>
        {carregando ? 'Salvando…' : 'Salvar nova senha'}
      </button>
    </form>
  );
}