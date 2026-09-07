type CalEvent = {
  type: 'linkReady' | 'bookingSuccessfulV2';
  data: Record<string, unknown>;
};

// Cal's SDK also broadcasts DOM events. Validate the original message against
// the active iframe before using it to change our booking confirmation screen.
export function readCalEmbedEvent(
  event: Pick<MessageEvent<unknown>, 'origin' | 'source' | 'data'>,
  iframe: Pick<HTMLIFrameElement, 'src' | 'contentWindow'> | null,
  namespace: string,
): CalEvent | null {
  if (!iframe?.contentWindow || event.source !== iframe.contentWindow) return null;

  try {
    const origin = new URL(iframe.src).origin;
    if (!['https://cal.com', 'https://app.cal.com'].includes(origin) || event.origin !== origin) {
      return null;
    }
  } catch {
    return null;
  }

  const message = event.data;
  if (!message || typeof message !== 'object' || !('fullType' in message)) return null;
  const prefix = `CAL:${namespace}:`;
  if (typeof message.fullType !== 'string' || !message.fullType.startsWith(prefix)) return null;

  const type = message.fullType.slice(prefix.length);
  if (type !== 'linkReady' && type !== 'bookingSuccessfulV2') return null;
  if (!('data' in message) || !message.data || typeof message.data !== 'object' || Array.isArray(message.data)) {
    return null;
  }

  return { type, data: message.data as Record<string, unknown> };
}

export function isConfirmedCalBooking(data: Record<string, unknown>): boolean {
  return typeof data.uid === 'string' && data.uid.trim().length > 0 &&
    data.status === 'ACCEPTED' && data.paymentRequired === false;
}
