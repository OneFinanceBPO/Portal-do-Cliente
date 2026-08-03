import { NextResponse } from "next/server";
import { db } from '@/lib/db';
import { getSessaoOuNull } from "@/lib/rbac";

export async function POST() {
    const sessao = await getSessaoOuNull();
    if (sessao) {
        await db.logAtividade.create({
            data: { usuarioId: sessao.id, categoria: 'login', acao: 'Logout' },
        });
    }
    return NextResponse.json({ ok: true });
}