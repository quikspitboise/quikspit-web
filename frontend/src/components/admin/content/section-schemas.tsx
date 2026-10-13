import type { PageSection, SectionType } from '@/lib/content/types';
import { BOOKING_COPY_DEFAULTS, CONTACT_COPY_DEFAULTS, LEGACY_CONTACT_COPY_KEYS } from '@/components/content/visitor-copy';
import { Field, inputClass } from '../ui';
import type { FieldSpec } from './field-editors';

export type CatalogOption = { value: string; label: string };

export type SchemaContext = {
  slug: string;
  /**
   * Catalog entries a price list row can quote from, as `category:<id>` or
   * `service:<id>`.
   */
  priceSources: CatalogOption[];
};

/** Picks which catalog entry supplies a row's “from” price. */
function priceSourceField(ctx: SchemaContext): FieldSpec {
  return {
    kind: 'custom',
    id: 'price-source',
    render: (item, onChange) => {
      const current = typeof item.categoryId === 'string'
        ? `category:${item.categoryId}`
        : typeof item.serviceId === 'string'
          ? `service:${item.serviceId}`
          : '';
      return (
        <Field label="Price from" hint="The lowest current price of this entry is shown, so it updates with Services & prices.">
          {({ id, describedBy }) => (
            <select
              id={id}
              aria-describedby={describedBy}
              value={current}
              className={inputClass}
              onChange={(event) => {
                const next = { ...item };
                delete next.categoryId;
                delete next.serviceId;
                delete next.includeEligiblePackage;
                const [kind, sourceId] = event.target.value.split(':');
                if (kind === 'category') next.categoryId = sourceId;
                if (kind === 'service') Object.assign(next, { serviceId: sourceId, includeEligiblePackage: true });
                onChange(next);
              }}
            >
              <option value="">No price</option>
              {ctx.priceSources.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          )}
        </Field>
      );
    },
  };
}

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Header',
  'rich-text': 'Text',
  services: 'Services',
  steps: 'Steps',
  reviews: 'Google reviews',
  social: 'Social feeds',
  cta: 'Call to action',
  faq: 'Questions',
  gallery: 'Photo gallery',
  contact: 'Contact details & form',
  booking: 'Booking',
  owner: 'Owner story',
};

const SURCHARGE_HINT = 'Write {surchargeRange} to show the current vehicle size price range, like “$25 to $55”.';
const DEPOSIT_HINT = 'Write {depositAmount} to show the deposit set under Booking.';

const heading = (extra: { label?: string; hint?: string } = {}): FieldSpec => ({ kind: 'text', key: 'heading', label: 'Heading', ...extra });
const body = (hint?: string): FieldSpec => ({ kind: 'text', key: 'body', label: 'Text', multiline: true, hint });
const link = (key: string, label: string): FieldSpec => ({ kind: 'link', key, label, optional: true });

function copyFields(key: string, label: string, defaults: Record<string, string>): FieldSpec {
  return {
    kind: 'group', key, label,
    hint: 'Leave blank to use the default text. Keep any {placeholders} to show the selected value.',
    fields: Object.entries(defaults).map(([fieldKey, text]) => ({
      kind: 'text', key: fieldKey,
      label: fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
      placeholder: text,
      multiline: text.length > 80,
    })),
  };
}

const SERVICE_GROUP_NOTES: Record<string, string> = {
  categories: 'Packages, prices, and what is included come from Services & prices.',
  addons: 'Add-ons and their prices come from Services & prices.',
  ceramicServices: 'Coatings, corrections, and prices come from Services & prices. The explainer text is under Business & site › Shared text.',
};

function servicesFields(section: PageSection, ctx: SchemaContext): FieldSpec[] {
  const group = typeof section.fields.catalogGroup === 'string' ? section.fields.catalogGroup : '';
  if (group) {
    return [
      { kind: 'note', text: SERVICE_GROUP_NOTES[group] ?? 'Items come from Services & prices.' },
      heading(),
      body(),
      ...(group === 'categories'
        ? [{ kind: 'text', key: 'priceNote', label: 'Note under the packages', multiline: true, hint: SURCHARGE_HINT } as FieldSpec]
        : []),
    ];
  }

  return [
    heading(),
    body(SURCHARGE_HINT),
    link('link', 'Link'),
    {
      kind: 'objectList',
      key: 'items',
      label: 'Services',
      itemLabel: 'Service',
      hint: 'Each row shows a “from” price taken from Services & prices, so it always matches.',
      fields: [
        { kind: 'text', key: 'name', label: 'Name' },
        { kind: 'text', key: 'description', label: 'Description', multiline: true },
        { kind: 'url', key: 'href', label: 'Goes to' },
        priceSourceField(ctx),
      ],
    },
  ];
}

/** Editable fields for a section. Fields not listed here are kept as they are. */
export function sectionFields(section: PageSection, ctx: SchemaContext): FieldSpec[] {
  const { fields } = section;
  switch (section.type) {
    case 'hero':
      return Array.isArray(fields.lines)
        ? [
            { kind: 'textList', key: 'lines', label: 'Headline', itemLabel: 'Line', hint: 'Each line starts on its own row.' },
            body(),
            link('primaryLink', 'Main button'),
            link('secondaryLink', 'Second button'),
            {
              kind: 'objectList',
              key: 'facts',
              label: 'Quick facts',
              itemLabel: 'Fact',
              fields: [
                { kind: 'text', key: 'term', label: 'Label' },
                { kind: 'text', key: 'detail', label: 'Detail' },
              ],
            },
          ]
        : [heading({ label: 'Page heading' }), body(ctx.slug === 'pricing' ? SURCHARGE_HINT : undefined)];
    case 'rich-text':
      return [heading(), { kind: 'textList', key: 'paragraphs', label: 'Paragraphs', itemLabel: 'Paragraph', multiline: true }, link('link', 'Link')];
    case 'services':
      return servicesFields(section, ctx);
    case 'steps':
      return [
        heading(),
        {
          kind: 'objectList',
          key: 'items',
          label: 'Steps',
          itemLabel: 'Step',
          hint: 'Numbered in this order.',
          fields: [
            { kind: 'text', key: 'title', label: 'Title' },
            { kind: 'text', key: 'body', label: 'Text', multiline: true },
          ],
        },
        link('link', 'Button'),
      ];
    case 'reviews':
      return [
        { kind: 'note', text: 'Reviews load from Google. Shared labels are under Business & site › Shared text.' },
        heading({ hint: 'Leave blank to use the shared heading.' }),
      ];
    case 'social':
      return [heading(), body(), link('link', 'Link'), { kind: 'note', text: 'Shows the Instagram and TikTok feeds.' }];
    case 'cta':
      return [
        heading(),
        body(),
        link('primaryLink', 'Main button'),
        link('secondaryLink', 'Second button'),
        { kind: 'boolean', key: 'showPhone', label: 'Show phone number', hint: 'Uses the phone number from Business & site.' },
      ];
    case 'faq':
      return [
        heading(),
        {
          kind: 'objectList',
          key: 'items',
          label: 'Questions',
          itemLabel: 'Question',
          summaryKey: 'q',
          hint: 'These also appear in search results as FAQ answers.',
          fields: [
            { kind: 'text', key: 'q', label: 'Question' },
            { kind: 'text', key: 'a', label: 'Answer', multiline: true, hint: SURCHARGE_HINT },
            {
              kind: 'text',
              key: 'depositAnswer',
              label: 'Answer when a deposit is required (optional)',
              multiline: true,
              hint: 'Used instead of the answer above while a booking deposit is set. ' + DEPOSIT_HINT,
            },
          ],
        },
      ];
    case 'gallery':
      return [
        { kind: 'note', text: 'Photos are managed in the Gallery tab.' },
        { kind: 'text', key: 'fallbackMessage', label: 'Message when photos are temporarily unavailable', multiline: true },
      ];
    case 'contact':
      return [
        { kind: 'note', text: 'Phone, email, hours, location, and social links come from Business & site.' },
        { kind: 'text', key: 'phoneLabel', label: 'Phone label' },
        { kind: 'text', key: 'emailLabel', label: 'Email label' },
        { kind: 'text', key: 'hoursLabel', label: 'Hours label' },
        { kind: 'text', key: 'locationLabel', label: 'Location label' },
        { kind: 'text', key: 'socialLabel', label: 'Social links label' },
        { kind: 'text', key: 'formHeading', label: 'Form heading' },
        { kind: 'text', key: 'formDescription', label: 'Form description', multiline: true },
        ...LEGACY_CONTACT_COPY_KEYS.map((key): FieldSpec => ({
          kind: 'text', key,
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()),
          placeholder: CONTACT_COPY_DEFAULTS[key],
          multiline: key === 'successMessage',
        })),
        copyFields('formCopy', 'Form labels & messages', Object.fromEntries(
          Object.entries(CONTACT_COPY_DEFAULTS).filter(([key]) => !LEGACY_CONTACT_COPY_KEYS.some((legacy) => legacy === key)),
        )),
      ];
    case 'booking':
      return [
        { kind: 'note', text: 'Packages and prices come from Services & prices. The deposit amount is set in the Booking tab.' },
        heading({ hint: 'Read by screen readers; not shown on screen.' }),
        { kind: 'text', key: 'depositPolicy', label: 'Deposit policy', multiline: true, hint: DEPOSIT_HINT + ' Shown only while a deposit is set.' },
        copyFields('copy', 'Booking labels & messages', BOOKING_COPY_DEFAULTS),
      ];
    case 'owner':
      return [
        heading(),
        { kind: 'text', key: 'caption', label: 'Photo caption' },
        { kind: 'text', key: 'imageAlt', label: 'Photo description for screen readers' },
        { kind: 'textList', key: 'paragraphs', label: 'Story', itemLabel: 'Paragraph', multiline: true },
        { kind: 'text', key: 'approachHeading', label: 'Second heading' },
        { kind: 'textList', key: 'approachParagraphs', label: 'Second part', itemLabel: 'Paragraph', multiline: true },
      ];
  }
}

/** A short line that identifies a section in the list. */
export function sectionSummary(section: PageSection): string {
  const { fields } = section;
  const text = [fields.heading, Array.isArray(fields.lines) ? fields.lines.join(' ') : undefined, fields.formHeading]
    .find((value) => typeof value === 'string' && value.trim());
  return typeof text === 'string' ? text : SECTION_LABELS[section.type];
}
