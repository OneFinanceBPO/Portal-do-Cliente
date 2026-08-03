import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessaoOuNull } from '@/lib/rbac';

const editarSchema = z.object({
  nome: z.string().min(2),
  cnpj: z.string().regex(/^\d{14}$/),
  segmento: z.string().optional(),
  ativo: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sessao = await getSessaoOuNull();
  if (!sessao || sessao.role !== 'ADMIN') return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });

  const body = await req.json();
  const parsed = editarSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const empresa = await db.empresa.update({ where: { id: params.id }, data: parsed.data });

  await db.logAtividade.create({
    data: { usuarioId: sessao.id, categoria: 'clientes', acao: 'Cliente editado', detalhe: empresa.nome },
  });

  return NextResponse.json({ cliente: empresa });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sessao = await getSessaoOuNull();
  if (!sessao || sessao.role !== 'ADMIN') return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });

  const empresa = await db.empresa.findUnique({ where: { id: params.id } });
  await db.empresa.delete({ where: { id: params.id } });

  await db.logAtividade.create({
    data: { usuarioId: sessao.id, categoria: 'clientes', acao: 'Cliente excluído', detalhe: empresa?.nome },
  });

  return NextResponse.json({ ok: true });
}