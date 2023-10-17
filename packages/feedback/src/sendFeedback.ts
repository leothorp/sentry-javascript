import type { BrowserClient, Replay } from '@sentry/browser';
import { getCurrentHub } from '@sentry/core';

import { sendFeedbackRequest } from './util/sendFeedbackRequest';

interface SendFeedbackParams {
  message: string;
  name?: string;
  email?: string;
  url?: string;
}

interface SendFeedbackOptions {
  includeReplay?: boolean;
}

/**
 * Public API to send a Feedback item to Sentry
 */
export function sendFeedback(
  { name, email, message, url = document.location.href }: SendFeedbackParams,
  { includeReplay = true }: SendFeedbackOptions = {},
) {
  const hub = getCurrentHub();
  const client = hub && hub.getClient<BrowserClient>();
  const replay = includeReplay && client ? (client.getIntegrationById('Replay') as Replay | undefined) : undefined;

  // Prepare session replay
  replay && replay.flush();
  const replayId = replay && replay.getReplayId();

  return sendFeedbackRequest({
    feedback: {
      name,
      email,
      message,
      url,
      replay_id: replayId,
    },
  });
}