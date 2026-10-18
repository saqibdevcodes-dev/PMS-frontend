import { t, useLocale, localeCode } from '../lib/i18n';
import { createContext, useContext, useEffect, useState } from 'react';
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
import { humanize, moneyFields } from '../lib/format';
import { MoneyInput } from './MoneyInput';
import { PatternFormat } from 'react-number-format';
import type { JsonSchema, Row } from '../lib/types';
import { Button, ErrorState } from './ui';
import { RelationSelect, relationPaths } from './RelationSelect';
import { Select } from './Select';
import { useUnsavedChanges } from '../hooks/use-unsaved';
import { validationDetails } from '../lib/error-messages';
import { fieldLabels, guidanceFor, imagePurpose } from '../lib/form-guidance';
import { ImageUpload } from './ImageUpload';
import { ImageGalleryUpload } from './ImageGalleryUpload';
import { FeatureEditor } from './FeatureEditor';
import { currencies, timezones } from '../lib/project-options';
import { verificationErrors } from '../lib/ownership';
import { OwnershipGuide } from './OwnershipVerification';
const Guidance = createContext({ path: '', uploading: (_key: string, _busy: boolean) => {} });
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
  useLocale();
  const form = useFormContext<Row>();
  const guidance = useContext(Guidance);
  const type = schemaType(schema);
  const parts = name.split('.');
  const fieldKey = /^\d+$/.test(parts.at(-1)!) ? parts.at(-2)! : parts.at(-1)!;
  const propertyForm = /\/units(?:\/|$)/.test(guidance.path);
  const hint =
    (fieldKey === 'type' && !propertyForm) || (fieldKey === 'charges' && !propertyForm)
      ? undefined
      : guidanceFor(fieldKey, guidance.path);
  const fieldLabel = t(
    label ??
      (fieldKey === 'charges' && guidance.path.includes('/transfers')
        ? 'Transfer fee'
        : undefined) ??
      (fieldKey === 'features' && !propertyForm ? 'Project features' : undefined) ??
      (fieldKey === 'photoId' && /\/customers(?:\/|$)/.test(guidance.path)
        ? 'Customer photo'
        : undefined) ??
      (fieldKey === 'code' && !/^\/projects(?:\/\{projectId\})?$/.test(guidance.path)
        ? 'Code'
        : fieldKey === 'type' && !propertyForm
          ? 'Type'
          : fieldKey === 'charges' && !propertyForm
            ? 'Fees'
            : fieldKey === 'amount' && !guidance.path.endsWith('/payments')
              ? 'Amount'
              : fieldLabels[fieldKey]) ??
      humanize(fieldKey),
  );
  const placeholder = hint ? t(hint[0]) : t('Enter {field}', { field: fieldLabel });
  const method = form.watch('method');
  const propertyType = form.watch('type');
  const clearanceStatus = form.watch('verification.clearanceStatus');
  const identityType = form.watch('identityType') ?? 'CNIC';
  const error = messageAt(form.formState.errors, name);
  const id = 'field-' + name;
  if (
    fieldKey === 'receivingAccountId' ||
    fieldKey === 'featureImages' ||
    (fieldKey === 'measurementUnit' && propertyForm) ||
    (name.startsWith('verification.') &&
      (((fieldKey === 'clearanceReference' || fieldKey === 'clearanceValidUntil') &&
        clearanceStatus !== 'VERIFIED') ||
        (fieldKey === 'clearanceReason' && clearanceStatus !== 'NOT_REQUIRED'))) ||
    (fieldKey === 'typeDetails' && propertyType !== 'OTHER') ||
    (fieldKey === 'methodDetails' && method !== 'OTHER')
  )
    return null;
  if (fieldKey === 'size' && propertyForm) {
    const unitName = parts.slice(0, -1).concat('measurementUnit').join('.');
    return (
      <div className="form-field">
        <label htmlFor={id}>
          {fieldLabel}
          {required && <span className="required"> *</span>}
        </label>
        <div className="area-input">
          <Controller
            name={name}
            control={form.control}
            render={({ field }) => (
              <input
                {...field}
                id={id}
                value={String(field.value ?? '')}
                inputMode="decimal"
                placeholder={t('e.g. 5')}
                aria-invalid={!!error}
                disabled={disabled}
              />
            )}
          />
          <Controller
            name={unitName}
            control={form.control}
            render={({ field }) => (
              <Select
                value={String(field.value ?? '')}
                onChange={field.onChange}
                aria-label={t('Area unit')}
                disabled={disabled}
                placeholder={t('Area unit')}
                options={['marla', 'kanal', 'sq ft', 'sq yd', 'sq m', 'acre', 'hectare'].map(
                  (value) => ({ value, label: humanize(value) }),
                )}
              />
            )}
          />
        </div>
        {hint && <small>{t(hint[1])}</small>}
        {(error || messageAt(form.formState.errors, unitName)) && (
          <p className="field-error" role="alert">
            {error ?? messageAt(form.formState.errors, unitName)}
          </p>
        )}
      </div>
    );
  }
  if (fieldKey === 'photoId' || fieldKey === 'proofImageId')
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <div className="form-field form-full">
            <ImageUpload
              value={String(field.value ?? '')}
              onChange={field.onChange}
              purpose={fieldKey === 'proofImageId' ? 'PAYMENT' : imagePurpose(guidance.path)}
              label={fieldLabel}
              required={
                required ||
                (fieldKey === 'proofImageId' &&
                  !!method &&
                  !['CASH', 'CHEQUE'].includes(String(method)))
              }
              disabled={disabled}
              onBusy={(b) => guidance.uploading(name, b)}
            />
            {hint && <small>{t(hint[1])}</small>}
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      />
    );
  if (fieldKey === 'photoIds')
    return (
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => (
          <div className="form-field form-full">
            <ImageGalleryUpload
              value={Array.isArray(field.value) ? field.value : []}
              onChange={field.onChange}
              purpose={imagePurpose(guidance.path)}
              label={propertyForm ? 'Property photos' : 'Project photos'}
              disabled={disabled}
              onBusy={(busy) => guidance.uploading(name, busy)}
            />
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      />
    );
  if (fieldKey === 'features')
    return (
      <FeatureEditor
        purpose={propertyForm ? 'FEATURE' : 'PROJECT'}
        name={name}
        disabled={disabled}
        onBusy={guidance.uploading}
      />
    );
  if (type === 'object')
    return (
      <fieldset
        className={'form-section' + (fieldKey === 'verification' ? ' verification-fields' : '')}
      >
        <legend>{fieldLabel}</legend>
        {fieldKey === 'verification' && (
          <OwnershipGuide compact possession={guidance.path.includes('/possessions')} />
        )}
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
                {fieldLabel}
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
                    aria-label={t('Remove {0} {1}', { '0': humanize(fieldKey), '1': index + 1 })}
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
                {t('Add')} {humanize(fieldKey)}
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
        {fieldLabel}
        {required && <span className="required"> *</span>}
      </label>
      <Controller
        name={name}
        control={form.control}
        render={({ field }) => {
          if (fieldKey === 'currency' || fieldKey === 'timezone') {
            const options = fieldKey === 'currency' ? currencies : timezones;
            const current = String(field.value ?? '');
            const names = new Intl.DisplayNames([localeCode()], { type: 'currency' });
            return (
              <Select
                {...field}
                id={id}
                value={current}
                disabled={disabled}
                aria-invalid={!!error}
                aria-describedby={hint ? id + '-help' : undefined}
                placeholder={`${t('Choose')} ${fieldLabel}`}
                options={[
                  ...(current && !options.includes(current)
                    ? [{ value: current, label: current }]
                    : []),
                  ...options.map((option) => ({
                    value: option,
                    label:
                      fieldKey === 'currency'
                        ? `${option} — ${names.of(option) ?? option}`
                        : option.replaceAll('_', ' '),
                  })),
                ]}
              />
            );
          }
          if (type === 'boolean')
            return (
              <input
                id={id}
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                aria-describedby={hint ? id + '-help' : undefined}
                aria-invalid={!!error}
                disabled={disabled}
              />
            );
          if (fieldKey === 'identity' && identityType === 'CNIC')
            return (
              <PatternFormat
                id={id}
                name={field.name}
                getInputRef={field.ref}
                onBlur={field.onBlur}
                value={String(field.value ?? '')}
                valueIsNumericString
                format="#####-#######-#"
                mask="_"
                inputMode="numeric"
                placeholder="35202-1234567-1"
                disabled={disabled}
                aria-invalid={!!error}
                onValueChange={(v, source) => {
                  if (source.source === 'event') field.onChange(v.value);
                }}
              />
            );
          if (moneyFields.test(fieldKey) && !schema.enum)
            return (
              <MoneyInput
                id={id}
                name={field.name}
                ref={field.ref}
                value={String(field.value ?? '')}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                aria-invalid={!!error}
                placeholder={placeholder}
              />
            );
          if (schema.enum)
            return (
              <Select
                {...field}
                onChange={(value) => {
                  field.onChange(value);
                  if (fieldKey === 'identityType') {
                    form.setValue('identity', '');
                    form.clearErrors('identity');
                  }
                  if (fieldKey === 'clearanceStatus') {
                    for (const key of [
                      'clearanceReference',
                      'clearanceValidUntil',
                      'clearanceReason',
                    ]) {
                      form.setValue('verification.' + key, undefined);
                      form.clearErrors('verification.' + key);
                    }
                  }
                  if (value !== 'OTHER') {
                    if (fieldKey === 'type' && propertyForm)
                      form.setValue('typeDetails', undefined);
                    if (fieldKey === 'method') form.setValue('methodDetails', undefined);
                  }
                }}
                value={String(field.value ?? '')}
                id={id}
                disabled={disabled}
                aria-invalid={!!error}
                placeholder={`${t('Choose')} ${humanize(fieldKey).toLowerCase()}`}
                options={schema.enum.map((value) => ({
                  value: String(value),
                  label: humanize(String(value)),
                }))}
              />
            );
          if (relationPaths[fieldKey])
            return (
              <RelationSelect
                id={id}
                name={fieldKey}
                value={String(field.value ?? '')}
                onChange={field.onChange}
                entityId={entityId}
                statusFilter={
                  fieldKey === 'bookingId' &&
                  /\/(transfers|possessions)(?:\/|$)/.test(guidance.path)
                    ? 'CONFIRMED'
                    : undefined
                }
                disabled={disabled}
              />
            );
          if (/notes|reason|comment|body|address/.test(fieldKey))
            return (
              <textarea
                {...field}
                value={String(field.value ?? '')}
                id={id}
                placeholder={placeholder}
                aria-describedby={hint ? id + '-help' : undefined}
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
              onChange={(event) => {
                field.onChange(event);
              }}
              value={value}
              id={id}
              type={inputType}
              placeholder={placeholder}
              aria-describedby={hint ? id + '-help' : undefined}
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
      {(hint?.[1] || schema.description) && (
        <small id={id + '-help'}>{t(hint?.[1] ?? schema.description ?? '')}</small>
      )}
      {schema.format === 'date-time' && (
        <small>{t('Enter time in this device’s local timezone.')}</small>
      )}
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
  operationPath = '',
}: {
  schema: JsonSchema;
  operationPath?: string;
  initial?: Row;
  onSubmit: (values: Row) => void;
  busy?: boolean;
  error?: unknown;
  entityId?: string;
  label?: string;
  locked?: boolean;
}) {
  useLocale();
  const [uploads, setUploads] = useState<Record<string, boolean>>({});
  const customerCreate = operationPath.endsWith('/customers') && !!schema.properties?.identity;
  const baseSchema: JsonSchema = schema.properties?.photoIds
    ? {
        ...schema,
        properties: Object.fromEntries(
          Object.entries(schema.properties).filter(([key]) => key !== 'photoId'),
        ),
      }
    : schema;
  const formSchema = baseSchema;
  const uploading = Object.values(uploads).some(Boolean);
  const [attemptError, setAttemptError] = useState<unknown>();
  const resolver = zodResolver(
    z.preprocess((value) => normalize(formSchema, value), validator(formSchema)) as z.ZodType<
      Row,
      Row
    >,
  );
  const form = useForm<Row>({
    resolver,
    defaultValues: {
      ...(defaults(formSchema) as Row),
      ...initial,
      ...(schema.properties?.photoIds
        ? {
            photoIds: Array.isArray(initial?.photoIds)
              ? initial.photoIds
              : initial?.photoId
                ? [initial.photoId]
                : [],
          }
        : {}),
    },
  });
  useEffect(() => {
    for (const detail of validationDetails(error))
      if (detail.path.length) form.setError(detail.path.join('.'), { message: detail.message });
  }, [error, form]);
  useUnsavedChanges(form.formState.isDirty || uploading);
  return (
    <Guidance.Provider
      value={{
        path: operationPath,
        uploading: (key, value) => setUploads((s) => ({ ...s, [key]: value })),
      }}
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit((v) => {
            setAttemptError(undefined);
            if (uploading) return;
            if (formSchema.properties?.verification) {
              const issues = verificationErrors(
                v.verification,
                Object.keys(formSchema.properties.verification.properties ?? {}),
              );
              if (issues.length) {
                for (const [key, message] of issues)
                  form.setError('verification.' + key, { message });
                form.setFocus('verification.' + issues[0]![0]);
                return;
              }
            }
            if (
              customerCreate &&
              (v.identityType ?? 'CNIC') === 'CNIC' &&
              !/^\d{13}$/.test(String(v.identity ?? '').replace(/[ -]/g, ''))
            ) {
              form.setError('identity', { message: t('Enter all 13 digits of the CNIC.') });
              return;
            }
            if (/\/units(?:\/|$)/.test(operationPath) && v.type === 'OTHER' && !v.typeDetails) {
              form.setError('typeDetails', { message: t('Describe the property type.') });
              return;
            }
            if (v.method === 'OTHER' && !v.methodDetails) {
              form.setError('methodDetails', { message: t('Describe how this payment was made.') });
              return;
            }
            if (
              operationPath.endsWith('/payments') &&
              !['CASH', 'CHEQUE'].includes(String(v.method)) &&
              !v.proofImageId
            ) {
              form.setError('proofImageId', {
                message: t('Upload a payment proof image for non-cash payments.'),
              });
              return;
            }
            if (
              operationPath.endsWith('/payments') &&
              ['BANK_TRANSFER', 'CHEQUE'].includes(String(v.method)) &&
              !String(v.transactionReference ?? '').trim()
            ) {
              form.setError('transactionReference', {
                message: t('Enter the cheque number or bank transaction ID.'),
              });
              return;
            }
            try {
              onSubmit(customerCreate ? (normalize(schema, v) as Row) : v);
            } catch (e) {
              setAttemptError(e);
            }
          })}
          noValidate
        >
          <div className="form-grid">
            {Object.entries(formSchema.properties ?? {})
              .filter(([key]) => !customerCreate || !['password', 'confirmPassword'].includes(key))
              .map(([key, field]) => (
                <SchemaField
                  key={key}
                  name={key}
                  schema={field}
                  required={schema.required?.includes(key)}
                  entityId={entityId}
                  disabled={busy || locked || uploading}
                />
              ))}
            {customerCreate && (
              <fieldset className="form-section">
                <legend>{t('Customer portal login')}</legend>
                <p className="muted">
                  {t(
                    'A secure password is generated automatically. The customer ID, login email and password are emailed to the customer. Check their email address before saving.',
                  )}
                </p>
              </fieldset>
            )}
          </div>
          {error || attemptError ? <ErrorState error={error ?? attemptError} /> : null}
          <footer className="form-footer">
            <span>{t('Changes are saved after server confirmation.')}</span>
            <Button type="submit" busy={busy || uploading} disabled={locked}>
              {t(label)}
            </Button>
          </footer>
        </form>
      </FormProvider>
    </Guidance.Provider>
  );
}
