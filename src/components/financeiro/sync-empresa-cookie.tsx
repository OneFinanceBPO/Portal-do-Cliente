'use client';

import { useEffect } from 'react';

export default function SyncEmpresaCookie({ clienteId }: { clienteId: string }) {
  useEffect(() => {
    document.cookie = `empresaAtual=${clienteId}; path=/; max-age=${60 * 60 * 8}`;
  }, [clienteId]);

  return null;
}