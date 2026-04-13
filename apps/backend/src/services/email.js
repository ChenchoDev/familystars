import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@familystars.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendMagicLink = async (email, token) => {
  const magicLink = `${FRONTEND_URL}/auth/verify/${token}`;

  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: '🌟 Tu enlace de acceso a FamilyStars',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #080C18;">🌟 FamilyStars</h1>
          <p>Hola,</p>
          <p>Se ha solicitado acceso a tu cuenta en FamilyStars. Haz clic en el enlace siguiente para acceder:</p>
          <p style="margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #9B59B6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Acceder a FamilyStars
            </a>
          </p>
          <p style="color: #666; font-size: 12px;">
            O copia este enlace en tu navegador:<br/>
            ${magicLink}
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Este enlace expira en 24 horas. Si no solicitaste acceso, ignora este correo.
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error('Error sending magic link email:', error);
    throw new Error('Failed to send magic link email');
  }
};

export const sendInvitationEmail = async (email, inviteUrl, familyName) => {
  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: '🌟 Eres invitado a FamilyStars',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #080C18;">🌟 ¡Bienvenido a FamilyStars!</h1>
          <p>Has sido invitado a unirte a la constelación familiar "${familyName}".</p>
          <p>FamilyStars es una plataforma colaborativa donde tu familia puede visualizar, completar y compartir vuestro árbol genealógico.</p>
          <p style="margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #3498DB; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Aceptar Invitación
            </a>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Este enlace expira en 7 días.
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

export const sendAdminNotification = async (subject, message) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.warn('ADMIN_EMAIL not configured');
    return null;
  }

  try {
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: adminEmail,
      subject: `🌟 [Admin] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>⚠️ Acción Requerida</h2>
          <p>${message}</p>
          <p style="margin-top: 30px;">
            <a href="${FRONTEND_URL}/admin" style="background-color: #F39C12; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ir a Panel Admin
            </a>
          </p>
        </div>
      `,
    });

    return response;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    throw new Error('Failed to send admin notification');
  }
};
