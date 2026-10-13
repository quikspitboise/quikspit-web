import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';

/** Immediate expiry shared by admin mutations of publicly cached data. */
export function refreshPublicCache({
  tags,
  paths = [],
  layoutPaths = [],
}: {
  tags: string[];
  paths?: string[];
  layoutPaths?: string[];
}): void {
  for (const tag of new Set(tags)) revalidateTag(tag, { expire: 0 });
  for (const path of new Set(paths)) revalidatePath(path);
  for (const path of new Set(layoutPaths)) revalidatePath(path, 'layout');
}
