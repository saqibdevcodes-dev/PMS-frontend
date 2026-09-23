import { useEffect, useState } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { defaults, normalize, schemaType, validator } from '../lib/schema';
import { humanize } from '../lib/format';
import type { JsonSchema, Row } from '../lib/types';
import { Button, ErrorState } from './ui';
import { RelationSelect, relationPaths } from './RelationSelect';
import { useUnsavedChanges } from '../hooks/use-unsaved';
import { ApiError } from '../lib/api';
function messageAt(errors: FieldErrors, path: string) {
  let current: unknown = errors;
  for (const key of path.split('.'))
    current =
      current && typeof current === 'object'
        ? (current as Record<string, unknown>)[key]
        : undefined;
  return current && typeof current === 'object' && 'message' in current
    ? String(current.message ?? '')
    : undefined;
}
export function SchemaField({
  name,
  schema,
  label,
  required,
  entityId,
  disabled,
}: {
  name: string;
  schema: JsonSchema;
  label?: string;
  required?: boolean;
  entityId?: string;
  disabled?: boolean;
}) {
  const form = useFormContext<Row>();
  const type = schemaType(schema);
  const parts = name.split('.');
  const fieldKey = /^\d+$/.test(parts.at(-1)!) ? parts.at(-2)! : parts.at(-1)!;
  const error = messageAt(form.formState.errors, name);
  const id = 'field-' + name;
  if (type === 'object')
    return (
      <fieldset className="form-section">
        <legend>{label ?? humanize(fieldKey)}</legend>
        <div className="form-grid">
          {Object.entries(schema.properties ?? {}).map(([key, child]) => (
            <SchemaField
              key={key}
              name={`${name}.${key}`}
              schema={child}
              required={schema.required?.includes(key)}
              entityId={entityId}
              disabled={disabled}
            />
          ))}
        </div>
      </fieldset>
    );
  if (type === 'array')
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => {
          const items = Array.isArray(field.value) ? field.value : [];
          return (
            <fieldset className="form-section">
              <legend>
                {label ?? humanize(fieldKey)}
                {required ? ' *' : ''}
              </legend>
              {items.map((_, index) => (
                <div className="array-item" key={index}>
                  <div className="array-fields">
                    {schemaType(schema.items ?? {}) === 'object' ? (
                      Object.entries(schema.items?.properties ?? {}).map(([key, child]) => (
                        <SchemaField
                          key={key}
                          name={`${name}.${index}.${key}`}
                          schema={child}
                          required={schema.items?.required?.includes(key)}
                          disabled={disabled}
                        />
                      ))
                    ) : (
                      <SchemaField
                        name={`${name}.${index}`}
                        label={`${humanize(fieldKey)} ${index + 1}`}
                        schema={schema.items ?? { type: 'string' }}
                        disabled={disabled}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${humanize(fieldKey)} ${index + 1}`}
                    onClick={() => field.onChange(items.filter((_, i) => i !== index))}
                    disabled={disabled}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => field.onChange([...items, defaults(schema.items ?? {})])}
                disabled={disabled || items.length >= (schema.maxItems ?? 100)}
              >
                <Plus size={14} />
                Add {humanize(fieldKey)}
              </Button>
              {error && <p className="field-error">{error}</p>}
            </fieldset>
          );
        }}
      />
    );
  return (
    <div
      className={
        'form-field ' +
        (type === 'boolean'
          ? 'form-check'
          : /notes|reason|comment|body|address/.test(fieldKey)
            ? 'form-full'
            : '')
      }
    >
      <label htmlFor={id}>
        {label ?? humanize(fieldKey)}
        {required && <span className="required"> *</span>}
      </label>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => {
          if (type === 'boolean')
            return (
              <input
                id={id}
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={disabled}
              />
            );
          if (schema.enum)
            return (
              <select
                {...field}
                value={String(field.value ?? '')}
                id={id}
                disabled={disabled}
                aria-invalid={!!error}
              >
                <option value="">Choose {humanize(fieldKey).toLowerCase()}</option>
                {schema.enum.map((v) => (
                  <option key={v} value={v}>
                    {humanize(String(v))}
                  </option>
                ))}
              </select>
            );
          if (relationPaths[fieldKey])
            return (
              <RelationSelect
                id={id}
                name={fieldKey}
                value={String(field.value ?? '')}
                onChange={field.onChange}
                entityId={entityId}
                disabled={disabled}
              />
            );
          if (/notes|reason|comment|body|address/.test(fieldKey))
            return (
              <textarea
                {...field}
                value={String(field.value ?? '')}
                id={id}
                rows={fieldKey === 'body' ? 6 : 3}
                disabled={disabled}
                aria-invalid={!!error}
              />
            );
          const inputType = /password/i.test(fieldKey)
            ? 'password'
            : schema.format === 'email'
              ? 'email'
              : schema.format === 'date'
                ? 'date'
                : schema.format === 'date-time'
                  ? 'datetime-local'
                  : ['number', 'integer'].includes(type)
                    ? 'number'
                    : 'text';
          const value =
            schema.format === 'date-time' &&
            typeof field.value === 'string' &&
            field.value.endsWith('Z')
              ? new Date(
                  new Date(field.value).getTime() -
                    new Date(field.value).getTimezoneOffset() * 60000,
                )
                  .toISOString()
                  .slice(0, 16)
              : String(field.value ?? '');
          return (
            <input
              {...field}
              value={value}
              id={id}
              type={inputType}
              step={type === 'integer' ? 1 : 'any'}
              inputMode={
                /amount|price|percent|charges|debit|credit|size|deduction/i.test(fieldKey)
                  ? 'decimal'
                  : undefined
              }
              autoComplete={inputType === 'password' ? 'new-password' : 'off'}
              disabled={disabled}
              aria-invalid={!!error}
            />
          );
        }}
      />
      {schema.description && <small>{schema.description}</small>}
      {schema.format === 'date-time' && <small>Enter time in this device’s local timezone.</small>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function SchemaForm({
  schema,
  initial,
  onSubmit,
  busy,
  error,
  entityId,
  label = 'Review changes',
  locked = false,
}: {
  schema: JsonSchema;
  initial?: Row;
  onSubmit: (values: Row) => void;
  busy?: boolean;
  error?: unknown;
  entityId?: string;
  label?: string;
  locked?: boolean;
}) {
  const [attemptError, setAttemptError] = useState<unknown>();
  const resolver = zodResolver(
    z.preprocess((value) => normalize(schema, value), validator(schema)) as z.ZodType<Row, Row>,
  );
  const form = useForm<Row>({
    resolver,
    defaultValues: { ...(defaults(schema) as Row), ...initial },
  });
  useEffect(() => {
    if (error instanceof ApiError && Array.isArray(error.details))
      for (const detail of error.details)
        form.setError(detail.path.join('.'), { message: detail.message });
  }, [error, form]);
  useUnsavedChanges(form.formState.isDirty);
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((v) => {
          setAttemptError(undefined);
          try {
            onSubmit(v);
          } catch (e) {
            setAttemptError(e);
          }
        })}
        noValidate
      >
        <div className="form-grid">
          {Object.entries(schema.properties ?? {}).map(([key, field]) => (
            <SchemaField
              key={key}
              name={key}
              schema={field}
              required={schema.required?.includes(key)}
              entityId={entityId}
              disabled={busy || locked}
            />
          ))}
        </div>
        {error || attemptError ? <ErrorState error={error ?? attemptError} /> : null}
        <footer className="form-footer">
          <span>Changes are saved after server confirmation.</span>
          <Button type="submit" busy={busy} disabled={locked}>
            {label}
          </Button>
        </footer>
      </form>
    </FormProvider>
  );
}
