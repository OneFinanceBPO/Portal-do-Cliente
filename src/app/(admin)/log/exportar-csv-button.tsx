'use client';

export default function ExportarCsvButton() {
  async function handleExport() {
    const res = await fetch('/api/v1/log');
    const { logs } = await res.json();

    const linhas = [
      ['Data', 'Usuário', 'Categoria', 'Ação', 'Detalhe'],
      ...logs.map((l: any) => [
        new Date(l.criadoEm).toLocaleString('pt-BR'),
        l.usuario?.email ?? '',
        l.categoria,
        l.acao,
        l.detalhe ?? '',
      ]),
    ];

    const csv = linhas.map((linha) => linha.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-atividades-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return <button onClick={handleExport} className="btn btn-ghost btn-sm">Exportar CSV</button>;
}