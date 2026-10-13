'use client';

import { useMemo } from 'react';
import { emailError, phoneError } from '@/lib/content/validation';
import type { BusinessDetails, SiteContent } from '@/lib/content/types';
import { Card, TextArea, TextInput } from '../ui';
import { DocumentShell, type PreviewTarget } from './document-shell';
import { FieldsEditor, collectProblems, type FieldSpec } from './field-editors';
import { metadataFields } from './metadata-fields';
import { useContentDocument } from './use-content-document';

const linkList = (key: string, label: string, itemLabel: string, hint?: string): FieldSpec => ({
  kind: 'objectList',
  key,
  label,
  itemLabel,
  hint,
  summaryKey: 'label',
  fields: [
    { kind: 'text', key: 'label', label: 'Text' },
    { kind: 'url', key: 'href', label: 'Goes to', required: true, placeholder: '/pricing' },
  ],
});

const LINK_FIELDS: FieldSpec[] = [
  linkList('navigation', 'Main menu', 'Menu link', 'Shown at the top of every page. The booking button is set separately below.'),
  { kind: 'link', key: 'bookingLink', label: 'Booking button', hint: 'The red button in the menu.' },
  linkList('footerLinks', 'Footer links', 'Footer link', 'Also suggested on the “page not found” screen.'),
  linkList('socialLinks', 'Social profiles', 'Profile', 'Instagram, TikTok, and Facebook links get their logo in the footer.'),
];

const COPY_FIELDS: FieldSpec[] = [
  {
    kind: 'group',
    key: 'seo',
    label: 'Search keywords',
    fields: [
      { kind: 'textList', key: 'keywords', label: 'Keywords', itemLabel: 'Keyword' },
    ],
  },
  {
    kind: 'group',
    key: 'ceramicInfo',
    label: 'Ceramic coating explainer',
    hint: 'The “What’s this?” popup on pricing and booking. Leave blank to use the built-in text.',
    fields: [
      { kind: 'text', key: 'title', label: 'Title', placeholder: 'What is Ceramic Coating?' },
      { kind: 'text', key: 'body', label: 'Explanation', multiline: true, hint: 'Leave an empty line between paragraphs.' },
    ],
  },
  {
    kind: 'group',
    key: 'reviews',
    label: 'Google reviews',
    fields: [
      { kind: 'text', key: 'heading', label: 'Heading' },
      { kind: 'text', key: 'unavailable', label: 'Message when reviews cannot load' },
      { kind: 'text', key: 'readLabel', label: 'Link text to read them on Google' },
      { kind: 'url', key: 'fallbackUrl', label: 'Google reviews address', hint: 'Used when Google does not provide a link.' },
      { kind: 'text', key: 'leaveLabel', label: 'Leave a review button' },
    ],
  },
  {
    kind: 'group',
    key: 'scheduling',
    label: 'Booking calendar',
    fields: [
      { kind: 'text', key: 'loading', label: 'While the calendar loads' },
      { kind: 'text', key: 'failed', label: 'When the calendar cannot load' },
      { kind: 'text', key: 'openLabel', label: 'Link to open Cal.com directly' },
    ],
  },
  { kind: 'text', key: 'footerDescription', label: 'Footer description', multiline: true },
  { kind: 'text', key: 'footerPagesHeading', label: 'Footer links heading' },
  { kind: 'text', key: 'footerContactHeading', label: 'Footer contact heading' },
  { kind: 'text', key: 'footerContactNote', label: 'Footer contact note' },
  { kind: 'text', key: 'copyright', label: 'Copyright line', hint: 'Shown after © and the current year.' },
  { kind: 'text', key: 'skipToContent', label: 'Skip link (keyboard users)' },
  { kind: 'text', key: 'openMenu', label: 'Menu button label (screen readers)' },
  { kind: 'text', key: 'closeMenu', label: 'Close menu label (screen readers)' },
];

const META_FIELDS = metadataFields({ titleHint: 'The home page title, and the ending of every other page title.' });

export function SiteEditor({ currentUserId, previewTargets }: { currentUserId: string; previewTargets: PreviewTarget[] }) {
  const state = useContentDocument<SiteContent>('site', 'business & site details');
  const site = state.draft;

  const problems = useMemo(() => {
    if (!site) return [];
    const { business } = site;
    return [
      ...(phoneError(business.phone) ? [`Phone number: ${phoneError(business.phone)}`] : []),
      ...(emailError(business.email) ? [`Email: ${emailError(business.email)}`] : []),
      ...collectProblems(LINK_FIELDS, site as unknown as Record<string, unknown>),
      ...collectProblems(META_FIELDS, site.metadata as Record<string, unknown>, 'Search defaults'),
      ...collectProblems(COPY_FIELDS, site.copy, 'Shared text'),
    ];
  }, [site]);

  const update = (change: (current: SiteContent) => SiteContent) =>
    state.setDraft((current) => (current ? change(current) : current));
  const setBusiness = (key: keyof BusinessDetails) => (value: string) =>
    update((current) => ({ ...current, business: { ...current.business, [key]: value } }));

  return (
    <DocumentShell state={state} currentUserId={currentUserId} previewTargets={previewTargets} problems={problems}>
      {site && (
        <>
          <Card title="Business details" description="Shown in the menu, footer, contact page, booking confirmation, and search results.">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Business name" value={site.business.name} onChange={setBusiness('name')} className="sm:col-span-2" />
              <TextInput
                label="Phone number as shown"
                hint="How visitors read it, like (208) 555-1234."
                value={site.business.phoneDisplay}
                onChange={setBusiness('phoneDisplay')}
                inputMode="tel"
              />
              <TextInput
                label="Phone number for calling"
                hint="International format: + then country code and number, no spaces."
                value={site.business.phone}
                onChange={(value) => setBusiness('phone')(value.replace(/[^\d+]/g, ''))}
                error={phoneError(site.business.phone)}
                inputMode="tel"
                placeholder="+12085551234"
              />
              <TextInput
                label="Email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                value={site.business.email}
                onChange={setBusiness('email')}
                error={emailError(site.business.email)}
                className="sm:col-span-2"
              />
              <TextInput label="Hours" value={site.business.hours} onChange={setBusiness('hours')} className="sm:col-span-2" />
              <TextInput label="Location" hint="The address is never shown; describe the area." value={site.business.serviceArea} onChange={setBusiness('serviceArea')} className="sm:col-span-2" />
              <TextArea label="Location note" value={site.business.locationNote} onChange={setBusiness('locationNote')} className="sm:col-span-2" rows={2} />
            </div>
          </Card>

          <Card title="Menus & links">
            <FieldsEditor
              fields={LINK_FIELDS}
              value={site as unknown as Record<string, unknown>}
              onChange={(next) => update(() => next as unknown as SiteContent)}
            />
          </Card>

          <Card title="Search defaults" description="Used for the home page and for any page without its own sharing image.">
            <FieldsEditor
              fields={META_FIELDS}
              value={site.metadata as Record<string, unknown>}
              onChange={(metadata) => update((current) => ({ ...current, metadata: metadata as SiteContent['metadata'] }))}
            />
          </Card>

          <Card title="Shared text" description="Small pieces of text used on several pages.">
            <FieldsEditor fields={COPY_FIELDS} value={site.copy} onChange={(copy) => update((current) => ({ ...current, copy }))} />
          </Card>
        </>
      )}
    </DocumentShell>
  );
}
