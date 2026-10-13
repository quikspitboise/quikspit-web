import { readText } from '@/lib/content/fields'

export const CONTACT_COPY_DEFAULTS = {
  nameLabel: 'Name',
  emailLabel: 'Email',
  messageLabel: 'What do you need?',
  messagePlaceholder: 'Vehicle, what it needs, and roughly when',
  photoLabel: 'Photo',
  optionalLabel: '(optional)',
  photoHint: 'JPG, PNG, or GIF, up to 5 MB.',
  submitLabel: 'Send message',
  sendingLabel: 'Sending…',
  successMessage: 'Message sent. We\'ll reply within a day.',
  nameRequired: 'Enter your name',
  emailRequired: 'Enter your email address',
  emailInvalid: 'Enter an email address like name@example.com',
  messageRequired: 'Tell us what you need',
  imageTooLarge: 'Image must be 5MB or smaller',
  imageTypeInvalid: 'Use a JPG, PNG, or GIF image',
  validationMessage: 'Some fields need attention. Check the messages next to them.',
  responseError: 'The message didn\'t send (error {status}). Try again, or call {phone}.',
  timeoutError: 'Sending took too long. Check your connection and try again.',
  connectionError: 'The message didn\'t send. Check your connection and try again, or call {phone}.',
} as const

export const BOOKING_COPY_DEFAULTS = {
  vehicleLabel: 'Vehicle',
  packageLabel: 'Package',
  addonsLabel: 'Add-ons',
  extrasShortLabel: 'Extras',
  ceramicLabel: 'Paint protection',
  paintShortLabel: 'Paint',
  scheduleLabel: 'Date and time',
  timeShortLabel: 'Time',
  progressLabel: 'Booking progress',
  stepCount: 'Step {current} of {total}',
  vehicleHeading: 'What are we detailing?',
  vehicleDescription: 'Bigger vehicles take longer, so the price goes up a little with size.',
  vehicleGroupLabel: 'Vehicle size',
  basePriceLabel: 'Base price',
  packageHeading: 'Choose a package',
  packageDescription: 'Prices below already include your vehicle size.',
  hideDetailsLabel: 'Hide details',
  compareDetailsLabel: 'Compare what’s included',
  showDetailsLabel: 'What\'s included?',
  addonsHeading: 'Anything extra?',
  addonsDescription: 'Optional. Pick as many as you like, or continue without any.',
  ceramicHeading: 'Protect the paint?',
  ceramicDescription: 'Optional. Your package qualifies for ceramic coating and paint correction.',
  includedCorrectionMessage: '{service} comes with the coating.',
  upgradeLabel: 'Optional upgrade',
  correctionChoiceHint: '(choose one, or none)',
  upgradeServiceLabel: 'Upgrade to {service}',
  scheduleHeading: 'Pick a time',
  scheduleDescription: 'Choose a day and time that works. You pay when the job is done.',
  calendarLoading: 'Loading the calendar…',
  calendarPreview: 'The Cal.com calendar appears here on the live site.',
  checkingPrice: 'Checking the price…',
  stalePriceMessage: 'Our prices were just updated. Reload the page to see the current price before you pick a time.',
  rejectedSelectionMessage: 'Part of this selection is no longer offered. Reload the page to see what is available.',
  reloadPricesLabel: 'Reload prices',
  backToLabel: 'Back to {step}',
  backLabel: 'Back',
  choosePackageHint: 'Choose a package to continue',
  continueToLabel: 'Continue to {step}',
  continueLabel: 'Continue',
  summaryLabel: 'Booking summary',
  summaryHeading: 'Your detail',
  editLabel: 'Edit',
  coatingLabel: 'Ceramic coating',
  correctionLabel: 'Paint correction',
  durationLabel: 'Takes about',
  estimatedTotalLabel: 'Estimated total',
  depositTodayLabel: 'Deposit today',
  dueAtAppointmentLabel: 'Due at the appointment',
  finalPriceMessage: 'The final price can change if the car needs more work than expected.',
  choosePackageMessage: 'Choose a package to see the total.',
  hideSummaryLabel: 'Hide',
  showSummaryLabel: 'Details',
  confirmationHeading: 'You\'re booked',
  confirmationDescription: 'A confirmation email with the time and the garage address is on its way.',
  totalLabel: 'Total',
  bookingDepositLabel: 'Booking deposit',
  paidAmountLabel: '{amount} paid',
  balanceLabel: 'Balance at service',
  prepHeading: 'Before your appointment',
  prepAddress: 'Check your email for the garage address. We don\'t publish it anywhere else.',
  prepValuables: 'Take any valuables out of the car.',
  prepArrival: 'Arrive on time so the detail can start on schedule.',
  prepReschedule: 'Need to move it? Reschedule for free up to 24 hours ahead.',
  questionsLabel: 'Questions? Call or text',
} as const

/** Only substitute the named display values supplied by the renderer. */
export function visitorCopy<T extends Record<string, string>>(
  fields: Record<string, unknown> | undefined,
  defaults: T,
  key: keyof T & string,
  values: Record<string, string | number> = {},
): string {
  const text = readText(fields, key)
  const template = text.trim() ? text : defaults[key]
  return template.replace(/\{([a-zA-Z]+)\}/g, (token, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : token,
  )
}

export function readCopyFields(fields: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const value = fields[key]
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

/** Older contact documents keep these labels directly on the section. */
export const LEGACY_CONTACT_COPY_KEYS = ['submitLabel', 'sendingLabel', 'successMessage', 'photoLabel'] as const

export function resolveContactCopy(fields: Record<string, unknown>): Record<string, unknown> {
  const legacy = Object.fromEntries(LEGACY_CONTACT_COPY_KEYS
    .filter((key) => typeof fields[key] === 'string')
    .map((key) => [key, fields[key]]))
  return { ...legacy, ...readCopyFields(fields, 'formCopy') }
}
