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
    <form onSubmit={handleSubmit}>
      <h2>Novo cliente</h2>
      <label htmlFor="nome">Nome / razão social</label>
      <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />

      <label htmlFor="cnpj">CNPJ (só números)</label>
      <input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={18} required />

      {erro && <p role="alert">{erro}</p>}
      <button type="submit" disabled={carregando}>{carregando ? 'Salvando…' : 'Criar cliente'}</button>
    </form>
  );
}