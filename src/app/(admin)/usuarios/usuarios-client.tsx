'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModalPerfil from './modal-perfil';

type Usuario = { id: string; nome: string; email: string; role: string; ativo: boolean | null; ultimoLogin: Date | null };
type Empresa = { id: string; nome: string };

export default function UsuariosClient({ usuarios, empresas }: { usuarios: Usuario[]; empresas: Empresa[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    if (searchParams.get('novo') === '1') {
      setModalAberto(true);
      router.replace('/usuarios');
    }
  }, [searchParams, router]);

  return (
    <>
      <div className="sec-header">
        <div className="sec-title">Usuários</div>
        <button className="btn btn-primary btn-sm" onClick={() => setModalAberto(true)}>+ Novo Perfil</button>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Status</th><th>Último login</th></tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'ADMIN' ? 'up' : 'neutral'}`}>
                    {u.role === 'ADMIN' ? 'Administrador' : 'Limitado'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.ativo ? 'up' : 'down'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td className="td-neu">{u.ultimoLogin ? new Date(u.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && <ModalPerfil empresas={empresas} onClose={() => setModalAberto(false)} />}
    </>
  );
}