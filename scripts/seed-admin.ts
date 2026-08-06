import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../src/lib/db';


function gerarSenhaAleatoria(): string {
  return crypto.randomBytes(9).toString('base64url'); 
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const nome = process.env.ADMIN_NOME?.trim() || 'Administrador';
  const senhaFoiInformada = !!process.env.ADMIN_SENHA;
  const senha = process.env.ADMIN_SENHA || gerarSenhaAleatoria();

  if (!email || !email.includes('@')) {
    console.error(' Defina ADMIN_EMAIL com um e-mail válido antes de rodar.');
    console.error('   Exemplo: ADMIN_EMAIL=voce@empresa.com npx tsx scripts/seed-admin.ts');
    process.exit(1);
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await db.usuario.upsert({
    where: { email },
    update: { senhaHash, role: 'ADMIN', ativo: true, nome },
    create: { nome, email, senhaHash, role: 'ADMIN', ativo: true },
  });

  console.log('');
  console.log(' Usuário admin pronto:');
  console.log(`   id:    ${usuario.id}`);
  console.log(`   nome:  ${usuario.nome}`);
  console.log(`   email: ${usuario.email}`);
  console.log(`   role:  ${usuario.role}`);
  if (!senhaFoiInformada) {
    console.log(`   senha: ${senha}`);
    console.log('   (gerada automaticamente — anote agora, não vai aparecer de novo)');
  } else {
    console.log('   senha: a que você definiu em ADMIN_SENHA');
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error(' Erro ao criar usuário admin:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());