import { NextRequest, NextResponse } from 'next/server';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { getDadosFinanceiro } from '@/lib/financeiro';

export async function GET(req: NextRequest) {
  const sessao = await getSessaoOuNull();
  if (!sessao) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const empresaId = searchParams.get('clienteId');
  const ano = parseInt(searchParams.get('ano') || `${new Date().getFullYear()}`, 10);
  const mesParam = searchParams.get('mes');
  const mes = mesParam && Number(mesParam) >= 1 && Number(mesParam) <= 12 ? Number(mesParam) : null;

  if (!empresaId) {
    return NextResponse.json({ error: 'Parâmetro clienteId obrigatório' }, { status: 400 });
  }
  if (!podeAcessarCliente(sessao, empresaId)) {
    return NextResponse.json({ error: 'Sem acesso a este cliente' }, { status: 403 });
  }

  const dados = await getDadosFinanceiro(empresaId, ano, mes);
  return NextResponse.json(dados);
}