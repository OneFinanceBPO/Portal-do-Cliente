'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NovoClienteForm() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const res = await fetch('/api/v1/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cnpj: cnpj.replace(/\D/g, '') }),
    });

    setCarregando(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(typeof data.error === 'string' ? data.error : 'Não foi possível criar o cliente.');
      return;
    }

    setNome(''); setCnpj('');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-group">
        <label className="form-lbl" htmlFor="nome">Nome / razão social</label>
        <div className="form-wrap">
          <input className="form-input" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-lbl" htmlFor="cnpj">CNPJ (só números)</label>
        <div className="form-wrap">
          <input className="form-input" id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={18} required />
        </div>
      </div>

      {erro && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}>{erro}</p>}
      <button type="submit" className="btn btn-primary" disabled={carregando}>
        {carregando ? 'Salvando…' : 'Criar cliente'}
      </button>
    </form>
  );
}