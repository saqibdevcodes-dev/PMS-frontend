import type { components } from '../generated/api';
export type Row = Record<string, unknown> & { id?: string };
export type User = Required<Pick<components['schemas']['User'], 'id' | 'name' | 'email'>> & {
  permissions: string[];
  accountType?: 'STAFF' | 'CUSTOMER';
  projects: { projectId: string }[];
};
export type Page<T = Row> = {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
export type JsonSchema = {
  type?: string | string[];
  format?: string;
  title?: string;
  description?: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  enum?: (string | number)[];
  const?: unknown;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  anyOf?: JsonSchema[];
  allOf?: JsonSchema[];
  additionalProperties?: boolean | JsonSchema;
  $ref?: string;
};
export type Operation = {
  id: string;
  path: string;
  method: 'get' | 'post' | 'patch' | 'delete';
  summary: string;
  permission?: string;
  public: boolean;
  body?: JsonSchema;
  parameters: { name: string; in: string; required: boolean; schema: JsonSchema }[];
  multipart: boolean;
};
export const asRows = (data: unknown): Row[] =>
  Array.isArray(data)
    ? (data as Row[])
    : typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)
      ? (data.items as Row[])
      : [];
export const row = (data: unknown): Row =>
  data && typeof data === 'object' && !Array.isArray(data) ? (data as Row) : {};
