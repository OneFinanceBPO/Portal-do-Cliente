import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailRecuperacaoSenha(destinatario: string, nome: string, link: string) {
  await resend.emails.send({
    from: 'One Finance <onboarding@resend.dev>',
    to: destinatario,
    subject: 'Redefinição de senha — One Finance',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1c2b4a;">Olá, ${nome}</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no Portal One Finance.</p>
        <p>Clique no botão abaixo para criar uma nova senha. Este link expira em 1 hora.</p>
        <p style="text-align:center; margin: 24px 0;">
          <a href="${link}" style="background:#3b7ce0; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size:12px; color:#888;">Se você não pediu isso, pode ignorar este e-mail com segurança.</p>
      </div>
    `,
  });
}