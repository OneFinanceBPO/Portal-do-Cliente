import { db } from '../src/lib/db';

// Uso:
//   EMPRESA="parte do nome" npx tsx scripts/diagnosticar-pendentes.ts
//   CNPJ=12345678000199 npx tsx scripts/diagnosticar-pendentes.ts
//
// Mostra as maiores transações "a receber" pendentes de uma empresa e
// procura por possíveis duplicatas (mesma data + resumo aparecendo mais de
// uma vez), pra descobrir se um valor absurdo em "Transações A Vencer" é
// um outlier de parsing, duplicata, ou dado real acumulado.

async function main() {
  const nomeBusca = process.env.EMPRESA;
  const cnpjBusca = process.env.CNPJ;

  if (!nomeBusca && !cnpjBusca) {
    console.error('Defina EMPRESA="parte do nome" ou CNPJ=<cnpj exato> antes de rodar.');
    console.error('Exemplo: EMPRESA="Acme" npx tsx scripts/diagnosticar-pendentes.ts');
    process.exit(1);
  }

  const empresa = await db.empresa.findFirst({
    where: cnpjBusca ? { cnpj: cnpjBusca } : { nome: { contains: nomeBusca, mode: 'insensitive' } },
  });

  if (!empresa) {
    console.error(`Nenhuma empresa encontrada para "${nomeBusca ?? cnpjBusca}"`);
    process.exit(1);
  }

  console.log(`\nEmpresa: ${empresa.nome} (${empresa.cnpj})\n`);

  const pendentesRec = await db.extratoMovimentacao.findMany({
    where: {
      empresa_id: empresa.id,
      situacao: { in: ['Em aberto', 'Agendado'] },
      valor: { gte: 0 }, // "a receber" — valores positivos
    },
    select: { valor: true, resumo: true, dataLancamento: true, data_vencimento: true, categoria: true },
    orderBy: { valor: 'desc' },
  });

  const soma = pendentesRec.reduce((s, p) => s + Number(p.valor ?? 0), 0);
  console.log(`Total de linhas "a receber" pendentes: ${pendentesRec.length}`);
  console.log(`Soma total: R$ ${soma.toLocaleString('pt-BR')}\n`);

  console.log('── Top 15 maiores valores individuais ──');
  for (const p of pendentesRec.slice(0, 15)) {
    const data = p.dataLancamento?.toISOString().slice(0, 10) ?? '—';
    const valor = Number(p.valor ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    console.log(`  R$ ${valor.padStart(18)}  |  ${data}  |  ${p.categoria ?? '—'}  |  ${p.resumo}`);
  }

  // Procura linhas com mesma data+resumo aparecendo mais de uma vez —
  // se a constraint (empresa_cnpj, data_lancamento, resumo, valor) não
  // pegou porque o resumo veio com espaço/maiúscula diferente entre
  // execuções do agente, aparece aqui.
  const porChave = new Map<string, typeof pendentesRec>();
  for (const p of pendentesRec) {
    const chave = `${p.dataLancamento?.toISOString().slice(0, 10)}|${(p.resumo ?? '').trim().toLowerCase()}`;
    if (!porChave.has(chave)) porChave.set(chave, []);
    porChave.get(chave)!.push(p);
  }
  const suspeitas = [...porChave.entries()].filter(([, arr]) => arr.length > 1);

  if (suspeitas.length > 0) {
    console.log(`\n⚠️  ${suspeitas.length} grupo(s) com mesma data+resumo repetido (possível duplicata):`);
    for (const [chave, arr] of suspeitas.slice(0, 15)) {
      const valores = arr.map((a) => Number(a.valor ?? 0).toLocaleString('pt-BR')).join(', ');
      console.log(`  ${chave}  →  ${arr.length}x  (valores: ${valores})`);
    }
  } else {
    console.log('\n✓ Nenhuma duplicata óbvia de data+resumo encontrada.');
  }

  // Quebra por categoria — pra ver quanto cada categoria representa do total
  const porCategoria = new Map<string, { qtd: number; soma: number }>();
  for (const p of pendentesRec) {
    const cat = p.categoria ?? '(sem categoria)';
    const atual = porCategoria.get(cat) ?? { qtd: 0, soma: 0 };
    atual.qtd += 1;
    atual.soma += Number(p.valor ?? 0);
    porCategoria.set(cat, atual);
  }
  console.log('\n── Por categoria (maior soma primeiro) ──');
  for (const [cat, v] of [...porCategoria.entries()].sort((a, b) => b[1].soma - a[1].soma)) {
    console.log(`  ${cat.padEnd(30)}  ${String(v.qtd).padStart(5)} linha(s)  R$ ${v.soma.toLocaleString('pt-BR')}`);
  }

  console.log('');
}

main().finally(() => db.$disconnect());