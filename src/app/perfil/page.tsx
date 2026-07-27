import { redirect } from 'next/navigation';
import { getSessaoOuNull } from '@/lib/rbac';
import { db } from '@/lib/db';
import TrocarSenhaForm from './trocar-senha-form';

export default async function PerfilPage() {
  const sessao = await getSessaoOuNull();
  if (!sessao) redirect('/login');

  const usuario = await db.usuario.findUniqueOrThrow({
    where: { id: sessao.id },
    select: { nome: true, email: true, role: true, ultimoLogin: true, acessos: true },
  });

  return (
    <main className="page">
      <div className="sec-header">
        <div className="sec-title">Meu perfil</div>
      </div>

      <div className="card" style={{ maxWidth: '440px', marginBottom: '20px' }}>
        <div className="form-group">
          <div className="form-lbl">Nome</div>
          <div>{usuario.nome}</div>
        </div>
        <div className="form-group">
          <div className="form-lbl">E-mail</div>
          <div>{usuario.email}</div>
        </div>
        <div className="form-group">
          <div className="form-lbl">Tipo</div>
          <span className={`badge ${usuario.role === 'ADMIN' ? 'up' : 'neutral'}`}>
            {usuario.role === 'ADMIN' ? 'Administrador' : 'Limitado'}
          </span>
        </div>
        <div className="form-group">
          <div className="form-lbl">Último login</div>
          <div>{usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleString('pt-BR') : '—'}</div>
        </div>
        <div className="form-group">
          <div className="form-lbl">Empresas com acesso</div>
          <div>{usuario.acessos.length}</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '440px' }}>
        <TrocarSenhaForm />
      </div>
    </main>
  );
}