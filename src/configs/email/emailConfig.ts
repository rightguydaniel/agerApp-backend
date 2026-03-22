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
          <img src="${logoUrl}" alt="AgerApp" style="width:100%;height:auto;display:block;" />
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

const WELCOME_EMAIL_SUBJECT = "Welcome to AgerApp";

const WELCOME_EMAIL_TEXT = `
Welcome!

We are excited to have you onboard. Our goal is simple: Less waste, more profit.

To get started, we recommend taking these three small steps today:
1. Add your products: Add products to your inventory so we can start tracking it for you.
2. Set your location: This ensures our weather alerts are pinpointed to your specific storage site or farm.
3. Turn on your notifications: We need to know that you receive alerts in a timely manner.

If you have any questions, you can go through the FAQs or reach out to our support team. We are here to help you grow.

Best regards,
The Ager Team
`.trim();

const WELCOME_EMAIL_HTML = `
  <div style="font-family:Arial, Helvetica, sans-serif;color:#244a26;">
    <p style="margin:0 0 16px;">Welcome!</p>
    <p style="margin:0 0 16px;">
      We are excited to have you onboard. Our goal is simple: Less waste, more profit.
    </p>
    <p style="margin:0 0 16px;">
      To get started, we recommend taking these three small steps today:
    </p>
    <p style="margin:0 0 12px;">
      1. <strong>Add your products:</strong> Add products to your inventory so we can start tracking it for you.
    </p>
    <p style="margin:0 0 12px;">
      2. <strong>Set your location:</strong> This ensures our weather alerts are pinpointed to your specific storage site or farm.
    </p>
    <p style="margin:0 0 16px;">
      3. <strong>Turn on your notifications:</strong> We need to know that you receive alerts in a timely manner.
    </p>
    <p style="margin:0 0 16px;">
      If you have any questions, you can go through the FAQs or reach out to our support team. We are here to help you grow.
    </p>
    <p style="margin:0 0 8px;">Best regards,</p>
    <p style="margin:0;">The Ager Team</p>
  </div>
`.trim();

const UNLOCK_FEATURES_EMAIL_SUBJECT = "Unlock Ager App's Unique Features.";

const UNLOCK_FEATURES_EMAIL_TEXT = `
Explore and enjoy Ager App.

From real-time tracking of stock levels to help users minimize spoilage, to a dedicated space for agribusinesses to connect, receive insights, and foster local trade partnerships, Ager App is here to assist you with your business.

Insights
Get weather updates and information on the market to stay ahead.

Business Manager
Monitor your inventory, sales, and customers with ease.

Community
Connect with other businesses and trade.

Start now: https://www.agerapp.com.ng/
`.trim();

const UNLOCK_FEATURES_EMAIL_HTML = `
  <div style="font-family:Arial, Helvetica, sans-serif;color:#244a26;">
    <div style="text-align:center;margin-bottom:24px;">
      <img
        src="https://img.mailinblue.com/10488101/images/content_library/original/69ac12cee758bd5bf6063cfa.png"
        alt="Ager App"
        style="max-width:408px;width:100%;height:auto;"
      />
    </div>
    <h2 style="margin:0 0 16px;text-align:center;color:#244a26;">
      Explore and enjoy Ager App
    </h2>
    <p style="margin:0 0 24px;text-align:center;line-height:1.6;">
      From real-time tracking of stock levels to help users minimize spoilage,
      to a dedicated space for agribusinesses to connect, receive insights, and
      foster local trade partnerships, Ager App is here to assist you with your
      business.
    </p>
    <div style="margin:0 0 24px;">
      <div style="margin:0 0 24px;text-align:center;">
        <img
          src="https://img.mailinblue.com/10488101/images/content_library/original/69a3159b0e9e4d63b3c22866.png"
          alt="Insights"
          style="width:100%;max-width:160px;height:auto;border-radius:8px;"
        />
        <h3 style="margin:12px 0 8px;color:#244a26;">Insights</h3>
        <p style="margin:0;line-height:1.6;">
          Get weather updates and information on the market to stay ahead.
        </p>
      </div>
      <div style="margin:0 0 24px;text-align:center;">
        <img
          src="https://img.mailinblue.com/10488101/images/content_library/original/69a3159bd81fd869eef1e033.png"
          alt="Business Manager"
          style="width:100%;max-width:160px;height:auto;border-radius:8px;"
        />
        <h3 style="margin:12px 0 8px;color:#244a26;">Business Manager</h3>
        <p style="margin:0;line-height:1.6;">
          Monitor your inventory, sales, and customers with ease.
        </p>
      </div>
      <div style="margin:0;text-align:center;">
        <img
          src="https://img.mailinblue.com/10488101/images/content_library/original/69a3159bc25a39a73aa3763f.png"
          alt="Community"
          style="width:100%;max-width:160px;height:auto;border-radius:8px;"
        />
        <h3 style="margin:12px 0 8px;color:#244a26;">Community</h3>
        <p style="margin:0;line-height:1.6;">
          Connect with other businesses and trade.
        </p>
      </div>
    </div>
    <div style="text-align:center;">
      <a
        href="https://www.agerapp.com.ng/"
        style="display:inline-block;background:#244a26;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;"
      >
        Start Now
      </a>
    </div>
  </div>
`.trim();

const FEEDBACK_EMAIL_SUBJECT = "We Want to Hear Your Thoughts on Ager App.";

const FEEDBACK_EMAIL_TEXT = `
Hello,

You’ve been using Ager for 7 days. Give us 60 seconds of your time to help us improve. Kindly fill this 5 questions survey for feedback.

Give feedback: https://forms.gle/DHBTFQowoPHCtHsz8
`.trim();

const FEEDBACK_EMAIL_HTML = `
  <div style="font-family:Arial, Helvetica, sans-serif;color:#244a26;">
    <div style="text-align:center;margin-bottom:24px;">
      <img
        src="https://img.mailinblue.com/10488101/images/content_library/original/69aff3170df711d7038f258a.jpeg"
        alt="Ager App Feedback"
        style="width:100%;height:auto;border-radius:12px;"
      />
    </div>
    <h2 style="margin:0 0 16px;color:#244a26;">Hello,</h2>
    <p style="margin:0 0 24px;line-height:1.7;">
      You’ve been using Ager for 7 days. Give us 60 seconds of your time to
      help us improve. Kindly fill this 5 questions survey for feedback.
    </p>
    <div style="text-align:center;">
      <a
        href="https://forms.gle/DHBTFQowoPHCtHsz8"
        style="display:inline-block;background:#b1ed9f;color:#244a26;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;"
      >
        Give a feedback
      </a>
    </div>
  </div>
`.trim();

const EFFICIENCY_HACK_EMAIL_SUBJECT = "Are you worried about [Weather/Stock]?";

const EFFICIENCY_HACK_EMAIL_TEXT = `
The Efficiency Hack.

Set Up Your Restock Buffer Today.

Quick question: Do you know exactly what’s in your store right now without going there to check?

One of the most powerful features of Ager is the Restock & Spoilage Alert. By keeping your inventory updated, the app will automatically nudge you when it's time to sell or restock.

Try this today: Check your "Analytics" tab. It’s the easiest way to see which products are moving and which ones might be at risk of loss.

Keep thriving,
The Ager Team
`.trim();

const EFFICIENCY_HACK_EMAIL_HTML = `
  <div style="font-family:Arial, Helvetica, sans-serif;color:#1e1e1e;">
    <div style="text-align:center;margin-bottom:24px;">
      <img
        src="https://img.mailinblue.com/10488101/images/content_library/original/69a3159b0e9e4d63b3c22867.png"
        alt="Ager App"
        style="max-width:400px;width:100%;height:auto;"
      />
    </div>
    <h1 style="margin:0 0 20px;text-align:center;color:#1e1e1e;">
      The Efficiency Hack.
    </h1>
    <h2 style="margin:0 0 16px;color:#1e1e1e;">
      Set Up Your Restock Buffer Today.
    </h2>
    <p style="margin:0 0 16px;line-height:1.7;">
      Quick question: Do you know exactly what’s in your store right now
      without going there to check?
    </p>
    <p style="margin:0 0 16px;line-height:1.7;">
      One of the most powerful features of Ager is the
      <strong>Restock &amp; Spoilage Alert</strong>. By keeping your inventory
      updated, the app will automatically nudge you when it's time to sell or
      restock.
    </p>
    <p style="margin:0 0 16px;line-height:1.7;">
      <strong>Try this today:</strong> Check your "Analytics" tab. It’s the
      easiest way to see which products are moving and which ones might be at
      risk of loss.
    </p>
    <p style="margin:0 0 8px;line-height:1.7;">Keep thriving,</p>
    <p style="margin:0;line-height:1.7;">The Ager Team</p>
  </div>
`.trim();

const COMMUNITY_EMAIL_SUBJECT = "You're not in this alone";

const COMMUNITY_EMAIL_TEXT = `
The Power of Community.

No Business is an Island.

Agriculture is better when we work together. Have you checked out the Community tab in the Ager App yet?

It’s a space where you can:
- Connect with other agribusinesses around you.
- Share tips on managing local pests or market prices.
- Find potential buyers or suppliers nearby.

Hop in and say hello to your fellow business owners today!

Keep thriving,
The Ager Team
`.trim();

const COMMUNITY_EMAIL_HTML = `
  <div style="font-family:Arial, Helvetica, sans-serif;color:#1e1e1e;">
    <div style="text-align:center;margin-bottom:24px;">
      <img
        src="https://img.mailinblue.com/10488101/images/content_library/original/69a3159b833e9f4b8b7cf445.png"
        alt="Ager App Community"
        style="max-width:400px;width:100%;height:auto;"
      />
    </div>
    <h1 style="margin:0 0 20px;text-align:center;color:#1e1e1e;">
      The Power of Community.
    </h1>
    <h2 style="margin:0 0 16px;color:#1e1e1e;">
      No Business is an Island.
    </h2>
    <p style="margin:0 0 16px;line-height:1.7;">
      Agriculture is better when we work together. Have you checked out the
      Community tab in the Ager App yet?
    </p>
    <p style="margin:0 0 12px;line-height:1.7;">It’s a space where you can:</p>
    <ul style="margin:0 0 16px 20px;padding:0;line-height:1.8;">
      <li>Connect with other agribusinesses around you.</li>
      <li>Share tips on managing local pests or market prices.</li>
      <li>Find potential buyers or suppliers nearby.</li>
    </ul>
    <p style="margin:0 0 16px;line-height:1.7;">
      Hop in and say hello to your fellow business owners today!
    </p>
    <p style="margin:0 0 8px;line-height:1.7;">Keep thriving,</p>
    <p style="margin:0;line-height:1.7;">The Ager Team</p>
  </div>
`.trim();

export const sendWelcomeEmail = async (to: string) => {
  return sendEmail(
    to,
    WELCOME_EMAIL_SUBJECT,
    WELCOME_EMAIL_TEXT,
    WELCOME_EMAIL_HTML
  );
};

export const sendUnlockFeaturesEmail = async (to: string) => {
  return sendEmail(
    to,
    UNLOCK_FEATURES_EMAIL_SUBJECT,
    UNLOCK_FEATURES_EMAIL_TEXT,
    UNLOCK_FEATURES_EMAIL_HTML
  );
};

export const sendFeedbackEmail = async (to: string) => {
  return sendEmail(
    to,
    FEEDBACK_EMAIL_SUBJECT,
    FEEDBACK_EMAIL_TEXT,
    FEEDBACK_EMAIL_HTML
  );
};

export const sendEfficiencyHackEmail = async (to: string) => {
  return sendEmail(
    to,
    EFFICIENCY_HACK_EMAIL_SUBJECT,
    EFFICIENCY_HACK_EMAIL_TEXT,
    EFFICIENCY_HACK_EMAIL_HTML
  );
};

export const sendCommunityEmail = async (to: string) => {
  return sendEmail(
    to,
    COMMUNITY_EMAIL_SUBJECT,
    COMMUNITY_EMAIL_TEXT,
    COMMUNITY_EMAIL_HTML
  );
};
