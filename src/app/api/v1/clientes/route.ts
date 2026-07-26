import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessaoOuNull } from "@/lib/rbac";

export async function GET() {
    const sessao = await getSessaoOuNull();
    if (!sessao) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const empresa = await db.empresa.findMany({
        where: sessao.role === 'ADMIN' ? {} : { acessos: { some: { usuarioId: sessao.id } } },
        orderBy: { nome: 'asc' },
    });

    return NextResponse.json({ empresa });
}

const novoEmpresachema = z.object({
    nome: z.string().min(2),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ Deve ter 14 dígitos'),
});

export async function POST(req: NextRequest) {
    const sessao = await getSessaoOuNull();
    if (!sessao || sessao.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 })
    }

    const body = await req.json();
    const parsed = novoEmpresachema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const empresa = await db.empresa.create({ data: parsed.data });

    await db.logAtividade.create({
        data: {
            usuarioId: sessao.id,
            categoria: 'Clientes',
            acao: 'Cliente criado',
            detalhe: empresa.nome,
        },
    });

    return NextResponse.json({ cliente: empresa }, { status: 201 });

}