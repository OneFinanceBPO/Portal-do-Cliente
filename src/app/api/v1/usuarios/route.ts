import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessaoOuNull } from "@/lib/rbac";

export async function GET() {
    const usuarios = await db.usuarios.findMany({
        select: {
            id: true, nome: true, email: true, role: true, ativo: true, ultimoLogin: true,
            acessos: { select: { cliente: { select: { id: true, razaoSocial: true } } } },
        },
        orderBy: { nome: 'asc' },
    });
    return NextRequest.json({ usuarios });
}

const novoUsuarioSchema = z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    senha: z.string().min(8),
    role: z.enum(['ADMIN', 'LIMITADO']),
    clienteIds: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
    const sessao = await getSessaoOuNull();
    const body = await req.json();
    const parsed = novoUsuarioSchema.safeParse(body);
    if (!parsed.success) {
        return NextRequest.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { nome, email, senha, role, clienteIds } = parsed.data;
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await db.usuario.create({
        data: {
            nome,
            email: email.toLowerCase(),
            senhaHash,
            role,
            acessos: { create: clienteIds.map((clienteId) => ({ clienteId })) }
        },
    });

    await db.logAtividade.create({
        data: { usuarioId: sessao!.id, categoria: 'perfis', acao: 'Perfil criado', detalhe: email },
    });

    return NextResponse.json({ usuario: { id: usuario.id, nome, email, role } }, { status: 201 });
}