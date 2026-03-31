import { createOutboundAgentCall } from "@/lib/elevenlabs-agent";
import {
  buildSmsResponse,
  type TwilioSmsWebhook,
  validateTwilioSignature
} from "@/lib/twilio";

function xmlResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/xml; charset=utf-8"
    }
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const params = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
  );
  const payload = params as TwilioSmsWebhook;

  try {
    const isValid = validateTwilioSignature(request, params);

    if (!isValid) {
      return xmlResponse(buildSmsResponse("Webhook signature check failed."), 403);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook validation failed.";

    return xmlResponse(buildSmsResponse(message), 500);
  }

  const fromNumber = payload.From?.trim();
  const body = payload.Body?.trim();

  if (!fromNumber || !body) {
    return xmlResponse(
      buildSmsResponse("Missing required Twilio fields: From and Body."),
      400
    );
  }

  try {
    const result = await createOutboundAgentCall({
      messageBody: body,
      messageSid: payload.MessageSid,
      toNumber: fromNumber,
      twilioNumber: payload.To
    });

    const replyMessage =
      process.env.TWILIO_SMS_SUCCESS_REPLY ??
      "Emergency callback started. You should receive a call shortly.";

    return xmlResponse(
      buildSmsResponse(
        `${replyMessage} Reference: ${result.conversation_id ?? "pending"}`
      )
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to place callback.";
    const failureReply =
      process.env.TWILIO_SMS_FAILURE_REPLY ??
      "We received your emergency text but could not start the callback. Please call emergency services directly if this is urgent.";

    console.error("Failed to start ElevenLabs outbound call", {
      error: message,
      fromNumber,
      messageSid: payload.MessageSid
    });

    return xmlResponse(buildSmsResponse(failureReply), 500);
  }
}
