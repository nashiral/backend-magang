// src/services/email.service.js

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMailOTP(to, otp) {

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: "Kode OTP Verifikasi Email",
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Kode OTP Anda</h2>
        <p>Gunakan kode berikut untuk verifikasi email:</p>

        <div style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:6px;
          margin:20px 0;
        ">
          ${otp}
        </div>

        <p>Kode berlaku selama <b>5 menit</b>.</p>
      </div>
    `,
  });

}