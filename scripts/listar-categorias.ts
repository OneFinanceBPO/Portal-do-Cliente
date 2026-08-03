import { db } from '../src/lib/db';

async function main() {
    const categorias = await db.extratoMovimentacao.findMany({
        select: { categoria: true, valor: true },
        distinct: ['categoria'],
    });

    categorias
        .filter((c) => c.categoria)
        .sort((a, b) => (a.categoria! > b.categoria! ? 1 : -1))
        .forEach((c) => {
            const sinal = c.valor !== null && Number(c.valor) < 0 ? '(saida)' : '(entrada)';
            console.log(`${c.categoria} ${sinal}`);
        });
}

main().finally(() => db.$disconnect()); 