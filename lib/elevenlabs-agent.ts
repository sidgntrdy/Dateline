type OutboundAgentCallInput = {
  messageBody: string;
  messageSid?: string;
  toNumber: string;
  twilioNumber?: string;
};

type ConversationInitiationClientData = {
  dynamic_variables: Record<string, string>;
  conversation_config_override?: {
    agent?: {
      first_message?: string;
    };
  };
};

export async function createOutboundAgentCall({
  messageBody,
  messageSid,
  toNumber,
  twilioNumber
}: OutboundAgentCallInput) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const agentPhoneNumberId = process.env.ELEVENLABS_AGENT_PHONE_NUMBER_ID;

  if (!apiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY");
  }

  if (!agentId) {
    throw new Error("Missing ELEVENLABS_AGENT_ID");
  }

  if (!agentPhoneNumberId) {
    throw new Error("Missing ELEVENLABS_AGENT_PHONE_NUMBER_ID");
  }

  const response = await fetch(
    "https://api.elevenlabs.io/v1/convai/twilio/outbound-call",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: agentPhoneNumberId,
        to_number: toNumber,
        conversation_initiation_client_data: buildConversationData({
          messageBody,
          messageSid,
          toNumber,
          twilioNumber
        })
      }),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs outbound call failed with ${response.status}: ${errorText}`
    );
  }

  return (await response.json()) as {
    success: boolean;
    message: string;
    conversation_id: string | null;
    callSid: string | null;
  };
}

function buildConversationData({
  messageBody,
  messageSid,
  toNumber,
  twilioNumber
}: OutboundAgentCallInput): ConversationInitiationClientData {
  const dynamicVariables: Record<string, string> = {
    caller_number: toNumber,
    emergency_message: messageBody,
    received_at_iso: new Date().toISOString()
  };

  if (messageSid) {
    dynamicVariables.twilio_message_sid = messageSid;
  }

  if (twilioNumber) {
    dynamicVariables.twilio_number = twilioNumber;
  }

  const firstMessageOverride = process.env.ELEVENLABS_FIRST_MESSAGE_OVERRIDE;

  if (!firstMessageOverride) {
    return {
      dynamic_variables: dynamicVariables
    };
  }

  return {
    dynamic_variables: dynamicVariables,
    conversation_config_override: {
      agent: {
        first_message: `${firstMessageOverride} ${messageBody}`.trim()
      }
    }
  };
}
