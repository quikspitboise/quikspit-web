import type { FieldSpec } from './field-editors';

/** Search and social sharing fields shared by pages and the site defaults. */
export function metadataFields({ titleHint }: { titleHint?: string } = {}): FieldSpec[] {
  return [
    { kind: 'text', key: 'title', label: 'Search title', hint: titleHint ?? 'Shown in browser tabs and search results.' },
    { kind: 'text', key: 'description', label: 'Search description', multiline: true, hint: 'One or two sentences for search results. About 150 characters works best.' },
    { kind: 'text', key: 'socialTitle', label: 'Title when shared (optional)', hint: 'Used by Facebook, iMessage, and others. Leave blank to use the search title.' },
    { kind: 'text', key: 'socialDescription', label: 'Description when shared (optional)', multiline: true },
    { kind: 'url', key: 'socialImageUrl', label: 'Image when shared (optional)', hint: 'A site path like /hero_fallback.jpg or a full https:// image address.' },
    { kind: 'boolean', key: 'noIndex', label: 'Hide from search engines', hint: 'Asks Google and others not to list it.' },
  ];
}
