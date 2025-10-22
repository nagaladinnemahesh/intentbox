import { google } from "googleapis";
import oAuth2Client from "./googleClient.js";
import { htmlToText } from "html-to-text";

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

function getHeader(headers: any[], name: string): string {
  const header = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header ? header.value : "";
}

// decoding the body from base64 encryption

function decodeBase64(data: string): string {
  if (!data) return "";
  const buff = Buffer.from(
    data.replace(/-/g, "+").replace(/_/g, "/"),
    "base64"
  );
  return buff.toString("utf-8");
}

export async function listEmails() {
  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
      labelIds: ["INBOX"],
    });

    const messages = res.data.messages || [];
    const formattedEmails = [];

    for (const msg of messages) {
      const email = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
      });

      const headers = email.data.payload?.headers || [];
      const parts = email.data.payload?.parts || [];

      //extracting main fields from raw email headers

      const subject = getHeader(headers, "Subject");
      const from = getHeader(headers, "From");
      const to = getHeader(headers, "To");
      const date = getHeader(headers, "Date");
      const snippet = email.data.snippet;

      // extracting body from email

      let body = "";
      if (parts && parts.length > 0) {
        const htmlPart = parts.find((p) => p.mimeType === "text/html");
        const plainPart = parts.find((p) => p.mimeType === "text/plain");

        if (plainPart?.body?.data) {
          body = decodeBase64(plainPart.body.data);
        } else if (htmlPart?.body?.data) {
          const html = decodeBase64(htmlPart.body.data);
          body = htmlToText(html, { wordwrap: 130 });
        }
      } else if (email.data.payload?.body?.data) {
        const html = decodeBase64(email.data.payload.body.data);
        body = htmlToText(html, { wordwrap: 130 });
      }

      formattedEmails.push({
        id: msg.id,
        from,
        to,
        subject,
        date,
        snippet,
        body,
      });
    }

    return formattedEmails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}
