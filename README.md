# Dateline

Minimal Next.js app that runs with Bun, receives incoming SMS webhooks from Twilio, and triggers an ElevenLabs agent to call the sender back.

## Flow

1. A user texts your Twilio number.
2. Twilio sends a webhook to `POST /api/twilio/sms`.
3. The app validates `X-Twilio-Signature`.
4. The app calls ElevenLabs `POST /v1/convai/twilio/outbound-call`.
5. ElevenLabs places an outbound call to the sender using your configured agent and phone-number ID.

## Required setup

Before you run this app, create and configure these pieces:

1. A Twilio number that can receive SMS.
2. An ElevenLabs agent.
3. A Twilio-connected ElevenLabs phone number or verified caller ID that gives you an `ELEVENLABS_AGENT_PHONE_NUMBER_ID`.
4. Twilio auth token for webhook signature validation.

## Local development

1. Install dependencies:

   ```bash
   bun install
   ```

2. Copy env vars:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with your Twilio and ElevenLabs credentials.

4. Start the app:

   ```bash
   bun run dev
   ```

5. Expose it publicly with ngrok:

   ```bash
   ngrok http 3000
   ```

6. In the Twilio Console, set your phone number's Messaging webhook to:

   ```text
   https://your-ngrok-subdomain.ngrok.app/api/twilio/sms
   ```

   Use HTTP `POST`.

## Twilio webhook fields

This route expects Twilio's `application/x-www-form-urlencoded` webhook body and uses at least:

- `From`
- `To`
- `Body`
- `MessageSid`

Twilio documents incoming message webhook parameters here:
https://www.twilio.com/docs/messaging/guides/webhook-request

## ElevenLabs conversation data

The app passes the SMS into `conversation_initiation_client_data.dynamic_variables`:

- `caller_number`
- `emergency_message`
- `received_at_iso`
- `twilio_message_sid` when present
- `twilio_number` when present

Your ElevenLabs agent should use those variables in its prompt and first message. For example:

```text
You are handling an emergency callback. The caller number is {{caller_number}}.
Their text said: {{emergency_message}}.
```

If you want the app to force a custom first spoken line, set `ELEVENLABS_FIRST_MESSAGE_OVERRIDE`. That requires enabling first-message overrides in your agent's ElevenLabs security settings.

## Test the webhook

For a real end-to-end test:

1. Run the app locally.
2. Start ngrok.
3. Configure the Twilio messaging webhook URL.
4. Send an SMS to your Twilio number.

If the request is valid and ElevenLabs accepts it, the sender receives an SMS confirmation and then an outbound call from your ElevenLabs agent.
