import assert from 'node:assert/strict';
import test from 'node:test';
import { isConfirmedCalBooking, readCalEmbedEvent } from '../src/lib/cal-embed-events.ts';

const frameWindow = {};
const iframe = { src: 'https://app.cal.com/quikspitboise/full-detail', contentWindow: frameWindow };
const namespace = 'booking-test';
const payload = { uid: 'booking-123', status: 'ACCEPTED', paymentRequired: false };
const message = {
  origin: 'https://app.cal.com',
  source: frameWindow,
  data: { fullType: `CAL:${namespace}:bookingSuccessfulV2`, data: payload },
};

test('accepts the documented success envelope from the active Cal iframe', () => {
  assert.deepEqual(readCalEmbedEvent(message, iframe, namespace), {
    type: 'bookingSuccessfulV2', data: payload,
  });
  assert.equal(isConfirmedCalBooking(payload), true);
});

test('rejects messages from other origins, windows, and embed instances', () => {
  assert.equal(readCalEmbedEvent({ ...message, origin: 'https://example.org' }, iframe, namespace), null);
  assert.equal(readCalEmbedEvent({ ...message, source: {} }, iframe, namespace), null);
  assert.equal(readCalEmbedEvent(message, iframe, 'another-embed'), null);
  assert.equal(readCalEmbedEvent(message, null, namespace), null);
  assert.equal(readCalEmbedEvent(message, { ...iframe, contentWindow: null }, namespace), null);
  assert.equal(readCalEmbedEvent(message, { ...iframe, src: 'https://example.org/calendar' }, namespace), null);
});

test('rejects malformed and legacy unscoped success messages without throwing', () => {
  for (const data of [null, 'success', {}, { action: 'bookingSuccessful' },
    { type: 'CAL:bookingSuccessful' }, { fullType: 123 },
    { fullType: message.data.fullType, data: null },
    { fullType: message.data.fullType, data: [] }]) {
    assert.equal(readCalEmbedEvent({ ...message, data }, iframe, namespace), null);
  }
});

test('recognizes readiness only for the current trusted iframe', () => {
  const event = { ...message, data: { fullType: `CAL:${namespace}:linkReady`, data: {} } };
  assert.equal(readCalEmbedEvent(event, iframe, namespace)?.type, 'linkReady');
});

test('does not confirm bookings awaiting payment, approval, or a booking id', () => {
  for (const data of [{ ...payload, paymentRequired: true }, { ...payload, paymentRequired: undefined },
    { ...payload, status: 'PENDING' }, { ...payload, status: 'CANCELLED' },
    { ...payload, uid: '' }, { ...payload, uid: undefined }]) {
    assert.equal(isConfirmedCalBooking(data), false);
  }
});
