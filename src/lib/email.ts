import nodemailer from "nodemailer";

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export async function sendRecoveryEmail(
  to: string,
  code: string
): Promise<{ sent: boolean; preview?: string }> {
  const subject = "Employ.AI — Password recovery code";
  const text = [
    "You requested a password reset for your Employ.AI account.",
    "",
    `Your recovery code: ${code}`,
    "",
    "This code expires in 15 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:sans-serif;max-width:480px;color:#111">
      <h2 style="color:#0891b2">Employ.AI</h2>
      <p>You requested a password reset.</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#0891b2">${code}</p>
      <p style="color:#666;font-size:14px">This code expires in 15 minutes.</p>
      <p style="color:#666;font-size:14px">If you did not request this, ignore this email.</p>
    </div>
  `;

  if (!smtpConfigured()) {
    console.log(`[Employ.AI recovery] To: ${to} | Code: ${code}`);
    return { sent: false, preview: code };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
}
