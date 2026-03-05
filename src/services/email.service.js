// src/services/email.service.js
import nodemailer from "nodemailer";

function buildTransport() {
  const {
    EMAIL_SERVICE,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASS,
  } = process.env;

  if (EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: EMAIL_SERVICE, // e.g. "gmail"
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT ? Number(EMAIL_PORT) : 587,
    secure: EMAIL_SECURE === "true",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

export async function sendMailOTP(to, otp) {
  const transporter = buildTransport();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Kode OTP Verifikasi Email",
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Kode OTP Anda</h2>
        <p>Gunakan kode berikut untuk verifikasi email:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</div>
        <p>Kode berlaku selama <b>5 menit</b>. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
      </div>
    `,
  });
}
