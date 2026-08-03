import { cookies } from "next/headers";

export function getEmpresaIdAtual(searchParamClienteId?: string): string | null {
    if (searchParamClienteId) return searchParamClienteId;
    const cookie = cookies().get('empresaAtual');
    return cookie?.value ?? null;
}