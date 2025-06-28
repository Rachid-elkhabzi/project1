import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { company, username, email, pdfBase64 } = req.body;
  if (!company || !username || !email || !pdfBase64)
    return res.status(400).end("Missing fields");

  // Gmail SMTP via App Password (preferred)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,   // e.g. example@gmail.com
      pass: process.env.GMAIL_PASS,   // Google App Password
    },
  });

  try {
    await transporter.sendMail({
      from: `"${company}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Receipt from ${company}`,
      text: `Hello ${username},\n\nPlease find your receipt attached.`,
      attachments: [
        {
          filename: `receipt_${Date.now()}.pdf`,
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).end("Email error");
  }
}
