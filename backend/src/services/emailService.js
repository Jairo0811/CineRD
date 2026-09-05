const FRONTEND_URL = (process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const enviarEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY es obligatorio en producción para correos transaccionales");
    }
    console.info(JSON.stringify({ level: "info", event: "email.dev", to, subject, html }));
    return { dev: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "CineRD <noreply@cinerd.app>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`No se pudo enviar email transaccional (${response.status}): ${detail.slice(0, 300)}`);
  }

  return response.json();
};

const enviarVerificacionEmail = (email, nombre, token) => {
  const url = `${FRONTEND_URL}/verificar-email?token=${encodeURIComponent(token)}`;
  return enviarEmail({
    to: email,
    subject: "Verifica tu correo en CineRD",
    html: `<p>Hola ${nombre || ""},</p><p>Confirma tu correo para proteger tu cuenta de CineRD.</p><p><a href="${url}">Verificar correo</a></p><p>El enlace expira en 24 horas.</p>`,
  });
};

const enviarRecuperacionPassword = (email, nombre, token) => {
  const url = `${FRONTEND_URL}/restablecer-password?token=${encodeURIComponent(token)}`;
  return enviarEmail({
    to: email,
    subject: "Restablece tu contraseña de CineRD",
    html: `<p>Hola ${nombre || ""},</p><p>Recibimos una solicitud para restablecer tu contraseña.</p><p><a href="${url}">Restablecer contraseña</a></p><p>El enlace expira en 30 minutos. Si no hiciste esta solicitud, puedes ignorar este mensaje.</p>`,
  });
};

module.exports = { enviarEmail, enviarVerificacionEmail, enviarRecuperacionPassword };
