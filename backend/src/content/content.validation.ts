import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  CatalogContentDto,
  ContentKind,
  ContentValue,
  PageContentDto,
  SiteContentDto,
} from './dto/content.dto';

export function isSafeContentLink(value: string): boolean {
  if (!value || /[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  if (/^#[a-zA-Z][\w-]*$/.test(value)) return true;
  if (/^tel:\+[1-9]\d{7,14}$/.test(value)) return true;
  if (/^mailto:[^@?:]+@[^@?:]+\.[^@?:]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validateJson(
  value: unknown,
  kind: ContentKind,
  depth = 0,
  key = '',
  path = '',
): void {
  // Free-form JSON starts at its own root, independent of the DTO wrapper.
  if (
    (kind === 'site' && path === 'copy') ||
    (kind === 'page' && /^sections\.\d+\.fields$/.test(path))
  )
    depth = 0;
  if (depth > 10)
    throw new BadRequestException('Content exceeds nesting limit');
  if (
    /(?:href|url|src)$/i.test(key) &&
    (typeof value !== 'string' ||
      value.length > 2048 ||
      !isSafeContentLink(value))
  ) {
    throw new BadRequestException(`Unsafe content link: ${key}`);
  }
  if (typeof value === 'string') {
    if ([...value].length > 10000)
      throw new BadRequestException('Content text is too long');
    return;
  }
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (Array.isArray(value)) {
    if (value.length > 100)
      throw new BadRequestException('Content list is too long');
    value.forEach((child, index) =>
      validateJson(child, kind, depth + 1, key, `${path}.${index}`),
    );
    return;
  }
  if (!value || typeof value !== 'object')
    throw new BadRequestException('Invalid JSON content');
  const entries = Object.entries(value);
  if (entries.length > 100)
    throw new BadRequestException('Too many content fields');
  for (const [childKey, child] of entries) {
    if (
      !/^[a-zA-Z][\w-]{0,79}$/.test(childKey) ||
      ['__proto__', 'prototype', 'constructor'].includes(childKey)
    ) {
      throw new BadRequestException('Invalid content field name');
    }
    validateJson(
      child,
      kind,
      depth + 1,
      childKey,
      path ? `${path}.${childKey}` : childKey,
    );
  }
}

export function validateContent(kind: ContentKind, raw: unknown): ContentValue {
  if (Buffer.byteLength(JSON.stringify(raw) ?? '', 'utf8') > 80000)
    throw new BadRequestException('Content document is too large');
  validateJson(raw, kind);
  const options = {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  };
  const value =
    kind === 'site'
      ? plainToInstance(SiteContentDto, raw)
      : kind === 'catalog'
        ? plainToInstance(CatalogContentDto, raw)
        : plainToInstance(PageContentDto, raw);
  const errors = validateSync(value, options);
  if (errors.length)
    throw new BadRequestException({
      message: 'Invalid content document',
      errors,
    });

  if (kind === 'catalog') {
    const catalog = value as CatalogContentDto;
    const durations = [
      ...catalog.categories.flatMap((category) =>
        category.packages.map((pkg) => pkg.duration),
      ),
      ...catalog.ceramicServices.map((service) => service.duration),
    ];
    if (
      durations.some((duration) => duration.minMinutes > duration.maxMinutes)
    ) {
      throw new BadRequestException(
        'Minimum duration exceeds maximum duration',
      );
    }
    if (
      !catalog.categories.some(
        (category) =>
          category.enabled && category.packages.some((pkg) => pkg.enabled),
      ) ||
      !catalog.vehicleSizes.some((size) => size.enabled)
    ) {
      throw new BadRequestException(
        'Catalog needs an enabled package and vehicle size',
      );
    }
    for (const service of catalog.ceramicServices) {
      if (service.includedCorrectionId) {
        const correction = catalog.ceramicServices.find(
          (item) => item.id === service.includedCorrectionId,
        );
        if (
          service.kind !== 'coating' ||
          !correction ||
          correction.kind !== 'correction' ||
          (service.enabled && !correction.enabled)
        ) {
          throw new BadRequestException(
            'Coating must reference an available correction service',
          );
        }
      }
    }
  }
  return value;
}

export function pageKey(slug: string): string {
  if (
    !/^[a-z][a-z0-9-]{0,79}$/.test(slug) ||
    ['admin', 'api', 'sign-in', 'sign-up', 'resources'].includes(slug)
  ) {
    throw new BadRequestException('Invalid or reserved page slug');
  }
  return `page:${slug}`;
}
