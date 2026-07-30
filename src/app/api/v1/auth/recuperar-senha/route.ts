import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { enviarEmailRecuperacaoSenha } from '@/lib/email';

const schema = z.object({ email: z.string().email() });

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const usuario = await db.usuario.findUnique({ where: { email } });

  
  if (usuario && usuario.ativo) {
    const tokenBruto = crypto.randomBytes(32).toString('hex'); // vai no link do e-mail
    const tokenHash = hashToken(tokenBruto); // isso é o que salvamos no banco
    const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.tokenRecuperacao.create({
      data: { usuarioId: usuario.id, tokenHash, expiraEm },
    });

    const link = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${tokenBruto}`;

    try {
      await enviarEmailRecuperacaoSenha(usuario.email, usuario.nome, link);
    } catch (err) {
      console.error('[recuperar-senha] falha ao enviar e-mail:', err);
    }
  }

  return NextResponse.json({
    message: 'Se este e-mail estiver cadastrado, você receberá um link de redefinição em instantes.',
  });
}