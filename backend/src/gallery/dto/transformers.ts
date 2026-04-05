export function normalizeRequiredString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

export function normalizeOptionalString(value: unknown): string | undefined {
  const normalized = normalizeRequiredString(value);
  return normalized ? normalized : undefined;
}

export function parseStringArrayInput(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeRequiredString(entry)).filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(trimmedValue) as unknown;
    if (Array.isArray(parsedValue)) {
      return parsedValue
        .map((entry) => normalizeRequiredString(entry))
        .filter(Boolean);
    }
  } catch {
    // Fall back to comma-separated parsing below.
  }

  return trimmedValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
