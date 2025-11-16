import { Request, Response } from "express";
import sendResponse from "../utils/http/sendResponse";
import { sendEmail } from "../configs/email/emailConfig";

const CONTACT_RECIPIENT =
  process.env.CONTACT_RECIPIENT ?? "adetolajide@agerapp.com.ng";

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Submit a contact form
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               message:
 *                 type: string
 *                 example: "Hello, I would like to inquire about your services."
 *     responses:
 *       '200':
 *         description: Message sent successfully
 *       '400':
 *         description: Bad request, validation failed
 *       '500':
 *         description: Internal server error
 */
export const submitContactForm = async (request: Request, response: Response) => {
  const { name, email, message } = request.body ?? {};

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    sendResponse(response, 400, "Name, email, and message are required.");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    sendResponse(response, 400, "Please provide a valid email address.");
    return;
  }

  const subject = "New contact form submission";
  const plainText = `You received a new message from the AgerApp website contact form.\n\nName: ${trimmedName}\nEmail: ${trimmedEmail}\n\nMessage:\n${trimmedMessage}`;
  const htmlBody = `
    <p>You received a new message from the AgerApp website contact form.</p>
    <ul>
      <li><strong>Name:</strong> ${trimmedName}</li>
      <li><strong>Email:</strong> <a href="mailto:${trimmedEmail}">${trimmedEmail}</a></li>
    </ul>
    <p><strong>Message:</strong></p>
    <p>${trimmedMessage.replace(/\n/g, "<br />")}</p>
  `;

  try {
    await sendEmail(CONTACT_RECIPIENT, subject, plainText, htmlBody);
    sendResponse(response, 200, "Message sent successfully.");
  } catch (error: any) {
    console.error("Error sending contact form email:", error?.message ?? error);
    sendResponse(response, 500, "Failed to send contact message.");
  }
};