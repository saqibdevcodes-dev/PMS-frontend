import generated from '../generated/operations.json';
import { usePreferences } from '../stores/preferences';
import type { Operation } from './types';
export const operations = generated as Operation[];
export function operation(method: string, path: string) {
  const found = operations.find((o) => o.method === method && o.path === path);
  if (!found) throw new Error(`Missing API contract: ${method} ${path}`);
  return found;
}
export const projectRoot = '/projects/{projectId}';
export function resolvePath(path: string, values: Record<string, string> = {}) {
  const args = { projectId: usePreferences.getState().projectId, ...values };
  return path.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = args[key as keyof typeof args];
    if (!value) throw new Error('Choose a project or record first.');
    return encodeURIComponent(value);
  });
}
export function supportsQuery(path: string, key: string) {
  return (
    operations
      .find((o) => o.method === 'get' && o.path === path)
      ?.parameters.some((p) => p.in === 'query' && p.name === key) ?? false
  );
}
