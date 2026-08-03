'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Cliente = { id: string; nome: string; cnpj: string; segmento: string | null } | null;

const SEGMENTOS = ['Comércio', 'Serviço'];

export default function ModalCliente({ cliente, onClose }: { cliente: Cliente; onClose: () => void }) {
  const router = useRouter();
  const [nome, setNome] = useState(cliente?.nome ?? '');
  const [cnpj, setCnpj] = useState(cliente?.cnpj ?? '');
  const [segmento, setSegmento] = useState(cliente?.segmento ?? SEGMENTOS[1]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const editando = !!cliente;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(''); setCarregando(true);

    const body = { nome, cnpj: cnpj.replace(/\D/g, ''), segmento: segmento || undefined };
    const res = await fetch(editando ? `/api/v1/clientes/${cliente!.id}` : '/api/v1/clientes', {
      method: editando ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setCarregando(false);
    if (!res.ok) {
      const data = await res.json();
      setErro(typeof data.error === 'string' ? data.error : 'Não foi possível salvar.');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '400px' }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>{editando ? 'Editar cliente' : 'Novo Cliente'}</h2>

        <div className="form-group">
          <label className="form-lbl" htmlFor="nome">Nome da empresa</label>
          <div className="form-wrap"><input className="form-input" id="nome" placeholder="Ex: Empresa XYZ Ltda" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
        </div>
        <div className="form-group">
          <label className="form-lbl" htmlFor="cnpj">CNPJ</label>
          <div className="form-wrap">
            <input className="form-input" id="cnpj" placeholder="00.000.000/0001-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} maxLength={18} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-lbl" htmlFor="segmento">Segmento</label>
          <div className="form-wrap">
            <select className="filter-sel" id="segmento" value={segmento} onChange={(e) => setSegmento(e.target.value)} style={{ width: '100%' }}>
              {SEGMENTOS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {erro && <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px' }}>{erro}</p>}

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancelar</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={carregando}>
            {carregando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}