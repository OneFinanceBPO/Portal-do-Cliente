import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const schema = z.object({
    token: z.string().min(1),
    novaSenha: z.string().min(8),
});

function hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const { token, novaSenha } = parsed.data;
    const tokenHash = hashToken(token);

    const registro = await db.tokenRecuperacao.findFirst({
        where: { tokenHash, usado: false, expiraEm: { gt: new Date() } },
    });

    if (!registro) {
        return NextResponse.json({ error: 'Link inválido ou expirado. Solicite uma nova recuperação de senha.' }, { status: 400 });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await db.$transaction([
        db.usuario.update({ where: { id: registro.usuarioId }, data: { senhaHash } }),
        db.tokenRecuperacao.update({ where: { id: registro.id }, data: { usado: true } }),
    ]);

    await db.logAtividade.create({
        data: { usuarioId: registro.usuarioId, categoria: 'seguranca', acao: 'Senha redefinida via e-mail' },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso.' });
}