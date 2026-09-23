import { z } from 'zod';
import type { JsonSchema } from './types';
export function schemaType(schema: JsonSchema): string {
  return typeof schema.type === 'string'
    ? schema.type
    : schema.properties
      ? 'object'
      : schema.anyOf
        ? schemaType(schema.anyOf.find((s) => s.type !== 'null') ?? {})
        : 'string';
}
export function validator(schema: JsonSchema): z.ZodType {
  let result: z.ZodType;
  const type = schemaType(schema);
  if (type === 'object')
    result = z
      .object(
        Object.fromEntries(
          Object.entries(schema.properties ?? {}).map(([key, field]) => [
            key,
            schema.required?.includes(key) ? validator(field) : validator(field).optional(),
          ]),
        ),
      )
      .strict();
  else if (type === 'array') {
    let list = z.array(validator(schema.items ?? {}));
    if (schema.minItems !== undefined) list = list.min(schema.minItems);
    if (schema.maxItems !== undefined) list = list.max(schema.maxItems);
    result = list;
  } else if (type === 'boolean') result = z.boolean();
  else if (type === 'integer' || type === 'number') {
    let number = z.number();
    if (type === 'integer') number = number.int();
    if (schema.minimum !== undefined) number = number.min(schema.minimum);
    if (schema.maximum !== undefined) number = number.max(schema.maximum);
    result = number;
  } else {
    let text = z.string();
    if (schema.minLength !== undefined) text = text.min(schema.minLength);
    if (schema.maxLength !== undefined) text = text.max(schema.maxLength);
    if (schema.pattern)
      text = text.regex(new RegExp(schema.pattern), 'Check the format of this value.');
    if (schema.format === 'uuid')
      text = text.regex(/^[0-9a-f]{8}-[0-9a-f-]{27}$/i, 'Select a valid record.');
    if (schema.format === 'email') text = text.email('Enter a valid email address.');
    if (schema.format === 'date') text = text.regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date.');
    if (schema.format === 'date-time') text = text.datetime({ offset: true });
    result = text;
  }
  if (schema.enum)
    result = result.refine(
      (v) => schema.enum!.includes(v as string),
      'Choose one of the available values.',
    );
  for (const clause of schema.allOf ?? []) {
    if (clause.pattern)
      result = result.refine(
        (v) => typeof v === 'string' && new RegExp(clause.pattern!).test(v),
        'This value does not meet the required format.',
      );
  }
  return result;
}
export function defaults(schema: JsonSchema): unknown {
  if (schema.default !== undefined) return schema.default;
  if (schemaType(schema) === 'object')
    return Object.fromEntries(
      Object.entries(schema.properties ?? {})
        .filter(([k, v]) => schema.required?.includes(k) || v.default !== undefined)
        .map(([k, v]) => [k, defaults(v)]),
    );
  if (schemaType(schema) === 'array')
    return Array.from({ length: schema.minItems ?? 0 }, () => defaults(schema.items ?? {}));
  if (schemaType(schema) === 'boolean') return false;
  return '';
}
export function normalize(schema: JsonSchema, value: unknown): unknown {
  if (schemaType(schema) === 'object') {
    const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
    return Object.fromEntries(
      Object.entries(schema.properties ?? {}).flatMap(([key, field]) => {
        const input = record[key];
        if (
          !schema.required?.includes(key) &&
          (input === undefined || input === '' || (Array.isArray(input) && !input.length))
        )
          return [];
        return [[key, normalize(field, input)]];
      }),
    );
  }
  if (schemaType(schema) === 'array')
    return Array.isArray(value) ? value.map((v) => normalize(schema.items ?? {}, v)) : [];
  if (['integer', 'number'].includes(schemaType(schema)))
    return value === '' || value === undefined ? undefined : Number(value);
  if (schemaType(schema) === 'boolean') return Boolean(value);
  if (schema.format === 'date-time' && typeof value === 'string' && value) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toISOString();
  }
  return value;
}
