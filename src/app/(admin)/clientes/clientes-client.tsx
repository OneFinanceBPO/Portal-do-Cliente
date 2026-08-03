'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalCliente from './modal-cliente';
import GerenciamentoTour from '@/components/tour/gerenciamento-tour';

type Empresa = { id: string; nome: string; cnpj: string; segmento: string | null; ativo: boolean | null };

export default function ClientesClient({ empresas, isAdmin }: { empresas: Empresa[]; isAdmin: boolean }) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [segmentoFiltro, setSegmentoFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'nome-desc'>('nome');
  const [modalAberto, setModalAberto] = useState<false | 'novo' | Empresa>(false);

  const segmentos = useMemo(
    () => Array.from(new Set(empresas.map((e) => e.segmento).filter(Boolean))) as string[],
    [empresas]
  );

  const listaFiltrada = useMemo(() => {
    let lista = empresas.filter((e) => {
      const bateBusca = e.nome.toLowerCase().includes(busca.toLowerCase()) || e.cnpj.includes(busca);
      const bateSegmento = !segmentoFiltro || e.segmento === segmentoFiltro;
      return bateBusca && bateSegmento;
    });
    lista = [...lista].sort((a, b) => (ordenacao === 'nome' ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome)));
    return lista;
  }, [empresas, busca, segmentoFiltro, ordenacao]);

  async function handleExcluir(e: Empresa) {
    if (!confirm(`Excluir "${e.nome}"? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/v1/clientes/${e.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <main className="page">
      <GerenciamentoTour />

      <div className="search" data-tour="busca-cliente" style={{ maxWidth: '100%', marginBottom: '12px' }}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5A6.5 6.5 0 114 10.5a6.5 6.5 0 0113 0z" /></svg>
        <input placeholder="Buscar cliente…" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="filter-row">
        <select className="filter-sel" value={segmentoFiltro} onChange={(e) => setSegmentoFiltro(e.target.value)}>
          <option value="">Todos os segmentos</option>
          {segmentos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-sel" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value as any)}>
          <option value="nome">Nome A → Z</option>
          <option value="nome-desc">Nome Z → A</option>
        </select>
      </div>

      <div className="sec-header">
        <span style={{ fontSize: '12px', color: 'var(--text2)' }}>{listaFiltrada.length} cliente{listaFiltrada.length !== 1 ? 's' : ''}</span>
        {isAdmin && <button className="btn btn-primary btn-sm" data-tour="novo-cliente" onClick={() => setModalAberto('novo')}>+ Novo cliente</button>}
      </div>

      <div className="clients-grid">
        {listaFiltrada.map((e) => (
          <div key={e.id} className="client-card">
            <div className="client-icon">🏢</div>
            <div className="client-info" onClick={() => router.push(`/dashboard?clienteId=${e.id}`)} style={{ cursor: 'pointer' }}>
              <div className="client-name">{e.nome}</div>
              <div className="client-meta">{e.segmento ?? '—'} · {e.cnpj}</div>
            </div>
            {isAdmin && (
              <div className="client-actions">
                <button className="act-btn edit" title="Editar" onClick={() => setModalAberto(e)}>✎</button>
                <button className="act-btn del" title="Excluir" onClick={() => handleExcluir(e)}>🗑</button>
              </div>
            )}
          </div>
        ))}
        {listaFiltrada.length === 0 && <p style={{ color: 'var(--text2)' }}>Nenhum cliente encontrado.</p>}
      </div>

      {modalAberto && (
        <ModalCliente cliente={modalAberto === 'novo' ? null : modalAberto} onClose={() => setModalAberto(false)} />
      )}
    </main>
  );
}