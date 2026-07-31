import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `YuniExpress <noreply@yuniexpress.shop>`;

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Bem-vindo à YuniExpress! 🎉",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <div style="text-align:center;margin-bottom:20px;">
            <h1 style="color:#EAB308;margin:0;">YuniExpress</h1>
            <p style="color:#666;font-size:12px;">Compre Global, Pague Local</p>
          </div>
          <h2 style="color:#333;">Olá ${name}! 👋</h2>
          <p style="color:#555;line-height:1.6;">
            Bem-vindo à YuniExpress! A sua conta foi criada com sucesso.
          </p>
          <p style="color:#555;line-height:1.6;">
            Agora pode comprar milhares de produtos internacionais pagando em Meticais via M-Pesa, e-Mola ou Visa/Mastercard.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="https://yuniexpress.shop" style="background:#EAB308;color:#000;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Começar a Comprar
            </a>
          </div>
          <p style="color:#999;font-size:11px;text-align:center;">
            © 2026 YuniExpress. Moçambique 🇲🇿
          </p>
        </div>
      `,
    });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendOrderConfirmation(email: string, name: string, orderNumber: string, totalMZN: number) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Encomenda #${orderNumber} confirmada ✅`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h1 style="color:#EAB308;text-align:center;">YuniExpress</h1>
          <h2 style="color:#333;">Encomenda Confirmada! ✅</h2>
          <p style="color:#555;">Olá ${name}, a sua encomenda foi confirmada com sucesso.</p>
          <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:15px 0;">
            <p style="margin:5px 0;"><strong>Encomenda:</strong> #${orderNumber}</p>
            <p style="margin:5px 0;"><strong>Total:</strong> ${totalMZN.toLocaleString()} MT</p>
            <p style="margin:5px 0;"><strong>Entrega estimada:</strong> 15-40 dias</p>
          </div>
          <p style="color:#555;">Receberá actualizações por email e notificação quando a encomenda for enviada.</p>
          <div style="text-align:center;margin:20px 0;">
            <a href="https://yuniexpress.shop/account/orders" style="background:#EAB308;color:#000;padding:10px 25px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Ver Encomenda
            </a>
          </div>
          <p style="color:#999;font-size:11px;text-align:center;">© 2026 YuniExpress</p>
        </div>
      `,
    });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendShippedEmail(email: string, name: string, orderNumber: string, trackingNumber?: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Encomenda #${orderNumber} enviada! 🚚`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h1 style="color:#EAB308;text-align:center;">YuniExpress</h1>
          <h2 style="color:#333;">A sua encomenda foi enviada! 🚚</h2>
          <p style="color:#555;">Olá ${name}, boas notícias!</p>
          <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:15px 0;border:1px solid #bbf7d0;">
            <p style="margin:5px 0;"><strong>Encomenda:</strong> #${orderNumber}</p>
            ${trackingNumber ? `<p style="margin:5px 0;"><strong>Rastreamento:</strong> ${trackingNumber}</p>` : ""}
            <p style="margin:5px 0;"><strong>Entrega estimada:</strong> 15-30 dias</p>
          </div>
          <p style="color:#999;font-size:11px;text-align:center;">© 2026 YuniExpress</p>
        </div>
      `,
    });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Recuperar Password - YuniExpress",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h1 style="color:#EAB308;text-align:center;">YuniExpress</h1>
          <h2 style="color:#333;">Recuperar Password</h2>
          <p style="color:#555;">Recebeu este email porque solicitou a recuperação da sua password.</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="https://yuniexpress.shop/reset-password?token=${resetToken}" style="background:#EAB308;color:#000;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Redefinir Password
            </a>
          </div>
          <p style="color:#999;font-size:12px;">Se não solicitou esta recuperação, ignore este email. O link expira em 1 hora.</p>
          <p style="color:#999;font-size:11px;text-align:center;">© 2026 YuniExpress</p>
        </div>
      `,
    });
  } catch (e) { console.error("Email error:", e); }
}

export async function sendEmailVerification(email: string, name: string, token: string) {
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Confirme o seu email - YuniExpress",
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h1 style="color:#EAB308;text-align:center;">YuniExpress</h1>
          <h2 style="color:#333;">Confirme o seu Email</h2>
          <p style="color:#555;">Olá ${name}, clique no botão abaixo para confirmar o seu email e activar a sua conta:</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="https://yuniexpress.shop/verify-email?token=${token}" style="background:#EAB308;color:#000;padding:12px 30px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Confirmar Email
            </a>
          </div>
          <p style="color:#999;font-size:12px;">O link expira em 24 horas.</p>
          <p style="color:#999;font-size:11px;text-align:center;">© 2026 YuniExpress</p>
        </div>
      `,
    });
  } catch (e) { console.error("Email error:", e); }
}
