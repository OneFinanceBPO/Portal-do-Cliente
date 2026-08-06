import { NextRequest, NextResponse } from 'next/server';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { db } from '@/lib/db';


const STATUS_EM_ABERTO = ['pendente', 'em_andamento'];

export async function POST(req: NextRequest) {
  const sessao = await getSessaoOuNull();
  if (!sessao) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const empresaId = body?.clienteId;
  if (!empresaId) {
    return NextResponse.json({ error: 'Parâmetro clienteId obrigatório' }, { status: 400 });
  }
  if (!podeAcessarCliente(sessao, empresaId)) {
    return NextResponse.json({ error: 'Sem acesso a este cliente' }, { status: 403 });
  }

  const existente = await db.syncSolicitacao.findFirst({
    where: { empresaId, status: { in: STATUS_EM_ABERTO } },
    orderBy: { solicitadoEm: 'desc' },
  });
  if (existente) {
    return NextResponse.json(existente, { status: 202 });
  }

  const solicitacao = await db.syncSolicitacao.create({
    data: { empresaId, solicitadoPor: sessao.id, status: 'pendente' },
  });

  return NextResponse.json(solicitacao, { status: 202 });
}

export async function GET(req: NextRequest) {
  const sessao = await getSessaoOuNull();
  if (!sessao) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const empresaId = searchParams.get('clienteId');
  if (!empresaId) {
    return NextResponse.json({ error: 'Parâmetro clienteId obrigatório' }, { status: 400 });
  }
  if (!podeAcessarCliente(sessao, empresaId)) {
    return NextResponse.json({ error: 'Sem acesso a este cliente' }, { status: 403 });
  }

  const ultima = await db.syncSolicitacao.findFirst({
    where: { empresaId },
    orderBy: { solicitadoEm: 'desc' },
  });

  return NextResponse.json(ultima ?? null);
}