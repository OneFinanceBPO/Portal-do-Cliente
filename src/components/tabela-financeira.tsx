'use client';

import { useEffect, useState } from 'react';

type ResumoMensal = {
  mes: number;
  recTotal: number;
  pagTotal: number;
  qtdRec: number;
  qtdPag: number;
};

const MESES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const formatoBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function TabelaFinanceira({
  clienteId,
  destaque,
}: {
  clienteId: string;
  destaque: 'rec' | 'pag' | 'saldo';
}) {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [meses, setMeses] = useState<ResumoMensal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');
    fetch(`/api/v1/financeiro?clienteId=${clienteId}&ano=${ano}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          throw new Error(data.error || 'Erro ao carregar dados');
        }
        return r.json();
      })
      .then((data) => setMeses(data.meses ?? []))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [clienteId, ano]);

  if (carregando) return <p>Carregando…</p>;
  if (erro) return <p style={{ color: 'var(--red)' }}>{erro}</p>;

  return (
    <div>
      <label htmlFor="ano">Ano</label>
      <select id="ano" className="filter-sel" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
        {[ano - 1, ano, ano + 1].map((a) => <option key={a} value={a}>{a}</option>)}
      </select>

      <div className="tbl-wrap" style={{ marginTop: '16px' }}>
        <table>
          <thead>
            <tr>
              <th>Mês</th>
              {destaque !== 'pag' && <th>Recebido</th>}
              {destaque !== 'rec' && <th>Pago</th>}
              {destaque === 'saldo' && <th>Saldo</th>}
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr key={m.mes}>
                <td>{MESES[m.mes]}</td>
                {destaque !== 'pag' && <td className="td-pos">{formatoBRL.format(m.recTotal)}</td>}
                {destaque !== 'rec' && <td className="td-neg">{formatoBRL.format(m.pagTotal)}</td>}
                {destaque === 'saldo' && <td>{formatoBRL.format(m.recTotal - m.pagTotal)}</td>}
              </tr>
            ))}
            {meses.length === 0 && (
              <tr><td colSpan={3}>Nenhum lançamento encontrado para {ano}.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}