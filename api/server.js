// api/server.js
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config({ path: "../.env" }); // Load .env from root

const app = express();
const PORT = 5000;
const GMAIL_USER="rachidottaku@gmail.com"
const GMAIL_PASS="bsbpiaqbamysjjxl"
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/send", async (req, res) => {
  console.log("Email user:", GMAIL_USER);
  console.log(
    "Email pass:",
    GMAIL_PASS ? "✓ loaded" : "✗ not loaded"
  );
  try {
    const { to, company, client, pdf } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${company}" <${GMAIL_USER}>`,
      to,
      subject: `🧾 Receipt from ${company}`,
      text: `Hi ${client}, your receipt is attached.`,
      attachments: [
        {
          filename: `receipt_${client}.pdf`,
          content: Buffer.from(pdf, "base64"),
          contentType: "application/pdf",
        },
      ],
    });

    res.status(200).json({ message: "✅ Email sent successfully" });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ message: "❌ Mail failed", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
