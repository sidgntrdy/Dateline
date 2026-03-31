import twilio from "twilio";

export type TwilioSmsWebhook = {
  AccountSid?: string;
  Body?: string;
  From?: string;
  MessageSid?: string;
  NumMedia?: string;
  To?: string;
};

export function validateTwilioSignature(
  request: Request,
  params: Record<string, string>
) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get("x-twilio-signature");

  if (!authToken) {
    throw new Error("Missing TWILIO_AUTH_TOKEN");
  }

  if (!signature) {
    return false;
  }

  return twilio.validateRequest(
    authToken,
    signature,
    buildWebhookUrl(request),
    params
  );
}

export function buildSmsResponse(message: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(
    message
  )}</Message></Response>`;
}

function buildWebhookUrl(request: Request) {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");

  if (forwardedProto) {
    url.protocol = `${forwardedProto}:`;
  }

  if (host) {
    url.host = host;
  }

  return url.toString();
}

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
