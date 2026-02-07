import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: `${process.env.MAIL_HOST}`,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: `${process.env.MAIL_USERNAME}`,
    pass: `${process.env.MAIL_PASSWORD}`,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  text?: string,
  html?: string
) => {
  const logoUrl = "https://agerapp.com.ng/assets/agerApp-logo-G3s7oUoB.png";
  const bodyHtml = html
    ? html
    : text
      ? `<p style="margin:0 0 16px 0;line-height:1.6;color:#1E1E1E;">${text
          .replace(/\n/g, "<br/>")
          .trim()}</p>`
      : "";

  const brandedHtml = `
    <div style="background:#F8F8F8;padding:32px 16px;">
      <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E5EEE6;">
        <div style="background:#2E6130;padding:20px;text-align:center;">
          <img src="${logoUrl}" alt="AgerApp" style="height:48px;width:auto;display:inline-block;" />
        </div>
        <div style="padding:28px 24px;">
          <h1 style="margin:0 0 12px 0;font-size:22px;color:#2E6130;">${subject}</h1>
          ${bodyHtml}
        </div>
        <div style="padding:16px 24px;background:#F1F6F2;color:#2E6130;font-size:12px;text-align:center;">
          <div style="margin-bottom:8px;">
            <a href="https://www.instagram.com/agerapp/" style="color:#2E6130;text-decoration:none;margin:0 6px;">Instagram</a>
            <a href="https://www.tiktok.com/@agerapp" style="color:#2E6130;text-decoration:none;margin:0 6px;">TikTok</a>
            <a href="https://www.linkedin.com/company/agerapp/" style="color:#2E6130;text-decoration:none;margin:0 6px;">LinkedIn</a>
            <a href="https://x.com/agerapps" style="color:#2E6130;text-decoration:none;margin:0 6px;">Twitter</a>
            <a href="mailto:info@agerapp.com.ng" style="color:#2E6130;text-decoration:none;margin:0 6px;">Email</a>
          </div>
          AgerApp • Grow smarter, farm better
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USERNAME}>`,
    to,
    subject,
    text,
    html: brandedHtml,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
