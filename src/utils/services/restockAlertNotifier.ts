import { sendEmail } from "../../configs/email/emailConfig";

export type RestockAlertEmailItem = {
  productName: string;
  quantity: number;
  restockAlert: number;
};

export const sendRestockAlertEmail = async (
  to: string,
  businessName: string,
  items: RestockAlertEmailItem[]
) => {
  if (!to || items.length === 0) {
    return;
  }

  const subject =
    items.length === 1
      ? `Restock alert: ${items[0].productName}`
      : `Restock alert: ${items.length} products`;

  const text = [
    `Hi ${businessName},`,
    "",
    "The following product(s) have reached your restock alert level:",
    ...items.map(
      (item) =>
        `- ${item.productName}: quantity ${item.quantity} (alert ${item.restockAlert})`
    ),
    "",
    "Please restock as soon as possible.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1E1E1E;line-height:1.6;">
      <p style="margin:0 0 12px 0;">Hi ${businessName},</p>
      <p style="margin:0 0 12px 0;">The following product(s) have reached your restock alert level:</p>
      <ul style="margin:0 0 12px 18px;padding:0;">
        ${items
          .map(
            (item) =>
              `<li>${item.productName}: quantity <strong>${item.quantity}</strong> (alert ${item.restockAlert})</li>`
          )
          .join("")}
      </ul>
      <p style="margin:0;">Please restock as soon as possible.</p>
    </div>
  `;

  await sendEmail(to, subject, text, html);
};
