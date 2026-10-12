import { ApiError } from './errors';
import { humanize } from './format';
import { t } from './i18n';

type Detail = { path: (string | number)[]; message: string };

function friendlyValidation(detail: Detail) {
  const { message, path } = detail;
  if (/received (undefined|null)$/.test(message)) return t('Enter a value.');
  if (/^Invalid email/i.test(message)) return t('Enter a valid email address.');
  if (/^Invalid UUID/i.test(message))
    return path.some((part) => typeof part === 'string' && /photo|image/i.test(part))
      ? t('Choose a valid photo.')
      : t('Choose a valid record.');
  if (/^Invalid option:/.test(message)) return t('Choose one of the available options.');
  if (/^Invalid string:.*pattern/.test(message)) return t('Use the format shown below this field.');
  const length = message.match(/^Too (small|big): expected (string|array|number).*([<>]=)(\d+)/);
  if (length) {
    const values = { '0': length[4] };
    if (length[2] === 'string')
      return length[1] === 'small'
        ? t('Enter at least {0} characters.', values)
        : t('Use no more than {0} characters.', values);
    if (length[2] === 'array')
      return length[1] === 'small'
        ? t('Choose at least {0} items.', values)
        : t('Choose no more than {0} items.', values);
    return length[1] === 'small'
      ? t('Enter {0} or more.', values)
      : t('Enter {0} or less.', values);
  }
  if (/^Invalid input: expected/.test(message)) return t('Enter a valid value.');
  return t(message);
}

export function validationDetails(error: unknown): Detail[] {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) return [];
  return error.details
    .filter(
      (detail) =>
        detail &&
        Array.isArray(detail.path) &&
        detail.path.every((part) => typeof part === 'string' || typeof part === 'number') &&
        typeof detail.message === 'string',
    )
    .map((detail) => ({ ...detail, message: friendlyValidation(detail) }));
}

export function detailMessage(detail: Detail) {
  const label = detail.path
    .map((part) => (typeof part === 'number' ? t('Item {0}', { '0': part + 1 }) : humanize(part)))
    .join(' / ');
  return label ? `${label}: ${detail.message}` : detail.message;
}

export function errorDescription(error: unknown) {
  let title = t('Something needs your attention');
  let message = error instanceof Error ? t(error.message) : t('Unable to load this information.');
  const issues = validationDetails(error);
  let details = issues.map(detailMessage);
  if (error instanceof ApiError) {
    const unsupported = issues.filter((detail) => /^Unrecognized keys?:/.test(detail.message));
    if (unsupported?.length) {
      title = t('Update needed');
      message = unsupported.some((detail) => /["']photoIds["']/.test(detail.message))
        ? t(
            'The running backend does not support multiple photos yet. Update and restart the backend, then try again.',
          )
        : t(
            'This form and the server use different versions. Refresh the page. If this continues, ask an administrator to update the backend.',
          );
      details = issues
        .filter((detail) => !/^Unrecognized keys?:/.test(detail.message))
        .map(detailMessage);
    } else if (error.code === 'VALIDATION_ERROR') {
      title = t('Check your details');
      message = details.length
        ? t('Please correct the following details and try again.')
        : t('Some details are missing or invalid. Check the form and try again.');
    } else if (error.status === 403) {
      title = t('Access restricted');
      if (/^(Forbidden|Access denied|Insufficient permissions)[.!]?$/i.test(error.message))
        message = t('You do not have permission to do this. Ask an administrator for access.');
    } else if (error.status === 401) {
      title = t('Sign in again');
      if (
        /SESSION|TOKEN|EXPIRED/.test(error.code) ||
        /^(Unauthorized|Unauthenticated|Authentication required|Sign in first)[.!]?$/i.test(
          error.message,
        )
      )
        message = t('Your session has ended. Sign in again to continue.');
    } else if (error.code === 'DUPLICATE_RECORD') {
      title = t('Record already exists');
      message = t(
        'A record with these details already exists. Check existing records or change the duplicate details.',
      );
    } else if (error.code === 'BUSINESS_CONFLICT') {
      message = t(
        'This action conflicts with existing records. Refresh the record and check its current status.',
      );
    } else if (
      error.status === 404 &&
      /^(The requested record was not found\.|Record not found\.)$/.test(error.message)
    ) {
      message = t('This record is no longer available. Refresh the page and choose it again.');
    } else if (error.status >= 500) {
      title = t('Service unavailable');
      if (
        /^(The request could not be completed\.|The service could not complete this request\.)$/.test(
          error.message,
        )
      )
        message = t(
          'The service could not complete this action. Try again shortly. If it continues, contact an administrator.',
        );
    }
  }
  return { title, message, details: [...new Set(details)] };
}

export function errorMessage(error: unknown) {
  const { message, details } = errorDescription(error);
  return [message, ...details].join(' ');
}
