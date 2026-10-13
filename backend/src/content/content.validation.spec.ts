import { BadRequestException } from '@nestjs/common';
import { INITIAL_CONTENT_V1 } from './content-seed.v1';
import {
  isSafeContentLink,
  pageKey,
  validateContent,
} from './content.validation';
import type {
  CatalogContentDto,
  PageContentDto,
  SiteContentDto,
} from './dto/content.dto';

describe('content validation', () => {
  const initial = (key: string) =>
    structuredClone(INITIAL_CONTENT_V1.find((item) => item.key === key)!.value);
  const withJson = (kind: 'page' | 'site', fields: Record<string, unknown>) => {
    if (kind === 'site') {
      const site = initial('site') as SiteContentDto;
      site.copy = fields;
      return site;
    }
    const page = initial('page:home') as PageContentDto;
    page.sections[0].fields = fields;
    return page;
  };

  it('accepts every seeded document and preserves its data', () => {
    for (const document of INITIAL_CONTENT_V1) {
      expect(
        JSON.parse(
          JSON.stringify(validateContent(document.kind, document.value)),
        ),
      ).toEqual(document.value);
    }
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,test',
    '//evil.example',
    'http://example.com',
    'https://user:pass@example.com',
    '/\\evil.example',
    '/bad\npath',
  ])('rejects unsafe link %s', (href) => {
    expect(isSafeContentLink(href)).toBe(false);
    const page = initial('page:home') as PageContentDto;
    page.sections[0].fields.link = { label: 'Bad link', href };
    expect(() => validateContent('page', page)).toThrow(BadRequestException);
  });

  it.each([
    '/pricing#packages',
    '#packages',
    'https://example.com/a?b=c',
    'mailto:contact@example.com',
    'tel:+12089604970',
  ])('accepts supported link %s', (href) =>
    expect(isSafeContentLink(href)).toBe(true),
  );

  it('rejects missing metadata, unknown properties, duplicate sections, and malformed nested items', () => {
    const page = initial('page:home') as PageContentDto;
    for (const value of [
      { ...page, metadata: undefined },
      { ...page, executable: 'code' },
      { ...page, sections: [page.sections[0], page.sections[0]] },
      { ...page, sections: [null] },
      { ...page, sections: [{ ...page.sections[0], type: 'javascript' }] },
    ])
      expect(() => validateContent('page', value)).toThrow(BadRequestException);
  });

  it('rejects invalid money, invalid duration ranges, broken service references, and unusable catalogs', () => {
    const catalog = initial('catalog') as CatalogContentDto;
    const invalid = [
      (value: CatalogContentDto) => {
        value.categories[0].packages[0].basePriceCents = -1;
      },
      (value: CatalogContentDto) => {
        value.categories[0].packages[0].basePriceCents = 1.5;
      },
      (value: CatalogContentDto) => {
        value.categories[0].packages[0].duration.minMinutes = 9999;
      },
      (value: CatalogContentDto) => {
        value.ceramicServices[0].includedCorrectionId = 'missing';
      },
      (value: CatalogContentDto) => {
        value.vehicleSizes.forEach((size) => {
          size.enabled = false;
        });
      },
      (value: CatalogContentDto) => {
        value.addons.push(value.addons[0]);
      },
      (value: CatalogContentDto) => {
        value.categories[0].packages[0].duration = undefined!;
      },
      (value: CatalogContentDto) => {
        value.ceramicServices[0].kind = 'correction';
      },
    ];
    for (const mutate of invalid) {
      const value = structuredClone(catalog);
      mutate(value);
      expect(() => validateContent('catalog', value)).toThrow(
        BadRequestException,
      );
    }
  });

  it('rejects dangerous field names and excessive JSON size and depth', () => {
    const page = initial('page:home') as PageContentDto;
    for (const fields of [
      JSON.parse('{"__proto__":{"polluted":true}}'),
      { constructor: 'test' },
      { href: 42 },
      { imageUrl: null },
      { links: { href: ['https://example.com'] } },
      { body: 'x'.repeat(10001) },
      { body: Array.from({ length: 10 }, () => 'x'.repeat(9000)) },
      { body: Array.from({ length: 101 }, () => 'test') },
      Array.from({ length: 12 }).reduce((child) => ({ nested: child }), {}),
    ]) {
      page.sections[0].fields = fields as Record<string, unknown>;
      expect(() => validateContent('page', page)).toThrow(BadRequestException);
    }
  });

  it('accepts exactly 50 unique sections and rejects 51 or duplicate IDs', () => {
    const page = initial('page:home') as PageContentDto;
    page.sections = Array.from({ length: 50 }, (_, index) => ({
      id: `section-${index}`,
      type: 'rich-text',
      enabled: true,
      fields: { heading: `Section ${index}` },
    }));
    expect((validateContent('page', page) as PageContentDto).sections).toEqual(
      page.sections,
    );
    const extra = { ...page.sections[0], id: 'section-50' };
    expect(() =>
      validateContent('page', { ...page, sections: [...page.sections, extra] }),
    ).toThrow(BadRequestException);
    // Different content still cannot reuse another section's stable identity.
    page.sections[49] = { ...extra, id: page.sections[0].id };
    expect(() => validateContent('page', page)).toThrow(BadRequestException);
  });

  describe.each(['page', 'site'] as const)('%s free-form JSON', (kind) => {
    it.each(['x', '😀', 'e\u0301'])(
      'counts the 10,000-text limit in Unicode code points for %s',
      (character) => {
        const body = character.repeat(10000 / [...character].length);
        const value = withJson(kind, { body });
        expect(
          JSON.parse(JSON.stringify(validateContent(kind, value))),
        ).toEqual(value);
        expect(() =>
          validateContent(kind, withJson(kind, { body: `${body}x` })),
        ).toThrow('Content text is too long');
      },
    );

    it.each([false, true])(
      'accepts depth 10 and rejects depth 11 measured from the JSON root, mixed arrays: %s',
      (mixedArrays) => {
        const nested = (depth: number) => {
          let child: unknown = 'leaf';
          for (let index = depth; index >= 1; index -= 1)
            child =
              mixedArrays && index % 2 === 0 ? [child] : { nested: child };
          return child as Record<string, unknown>;
        };
        const value = withJson(kind, nested(10));
        expect(
          JSON.parse(JSON.stringify(validateContent(kind, value))),
        ).toEqual(value);
        expect(() => validateContent(kind, withJson(kind, nested(11)))).toThrow(
          'Content exceeds nesting limit',
        );
      },
    );

    it('accepts 100 object fields and rejects 101, including nested objects', () => {
      const fields = Object.fromEntries(
        Array.from({ length: 100 }, (_, index) => [`field${index}`, index]),
      );
      for (const nested of [false, true]) {
        const value = withJson(kind, nested ? { nested: fields } : fields);
        expect(
          JSON.parse(JSON.stringify(validateContent(kind, value))),
        ).toEqual(value);
        const tooMany = { ...fields, overflow: true };
        expect(() =>
          validateContent(
            kind,
            withJson(kind, nested ? { nested: tooMany } : tooMany),
          ),
        ).toThrow('Too many content fields');
      }
    });

    it('accepts 100 array entries and rejects 101', () => {
      const items = Array.from({ length: 100 }, (_, index) => ({
        label: index,
      }));
      const value = withJson(kind, { items });
      expect(JSON.parse(JSON.stringify(validateContent(kind, value)))).toEqual(
        value,
      );
      expect(() =>
        validateContent(kind, withJson(kind, { items: [...items, null] })),
      ).toThrow('Content list is too long');
    });

    it('does not restart the depth allowance at nested fields or copy keys', () => {
      let fields: Record<string, unknown> = { body: 'leaf' };
      for (let index = 0; index < 10; index += 1)
        fields = { [index % 2 === 0 ? 'fields' : 'copy']: fields };
      expect(() => validateContent(kind, withJson(kind, fields))).toThrow(
        'Content exceeds nesting limit',
      );
    });
  });

  it('bounds the complete serialized document to 80,000 UTF-8 bytes', () => {
    const page = initial('page:home') as PageContentDto;
    page.sections = [page.sections[0]];
    const fields: Record<string, unknown> = Object.fromEntries(
      Array.from({ length: 7 }, (_, index) => [
        `part${index}`,
        'x'.repeat(10000),
      ]),
    );
    fields.padding = '';
    page.sections[0].fields = fields;
    const remaining = 80000 - Buffer.byteLength(JSON.stringify(page), 'utf8');
    // A supplementary character is four bytes but one Unicode code point.
    fields.padding =
      '😀'.repeat(Math.floor(remaining / 4)) + 'x'.repeat(remaining % 4);
    expect(Buffer.byteLength(JSON.stringify(page), 'utf8')).toBe(80000);
    expect(JSON.parse(JSON.stringify(validateContent('page', page)))).toEqual(
      page,
    );
    fields.padding = `${fields.padding}x`;
    expect(() => validateContent('page', page)).toThrow(
      'Content document is too large',
    );
  });

  it.each([
    'admin',
    'api',
    'sign-in',
    'sign-up',
    'resources',
    '../escape',
    'nested/page',
    'UPPERCASE',
    'Foo.Bar',
  ])('rejects unavailable page slug %s', (slug) =>
    expect(() => pageKey(slug)).toThrow(BadRequestException),
  );
});
