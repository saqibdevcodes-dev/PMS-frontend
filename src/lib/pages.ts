import { api } from './api';
import type { Page } from './types';

// For bounded form option sets that must include records beyond the first page.
export async function allPages<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  for (;;) {
    const data = await api<Page<T>>(
      `${path}${path.includes('?') ? '&' : '?'}limit=100&page=${page}`,
      { signal },
    );
    items.push(...data.items);
    if (page >= data.pagination.totalPages || !data.items.length) return items;
    page++;
  }
}
