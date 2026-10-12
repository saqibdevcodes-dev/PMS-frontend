import { beforeEach, describe, expect, it } from 'vitest';
import { ApiError } from '../../src/lib/errors';
import { errorDescription, errorMessage, validationDetails } from '../../src/lib/error-messages';
import { usePreferences } from '../../src/stores/preferences';

beforeEach(() => usePreferences.getState().setLanguage('en'));

describe('actionable API errors', () => {
  it('explains the older backend gallery schema instead of showing technical keys or reference IDs', () => {
    const error = new ApiError(
      422,
      'VALIDATION_ERROR',
      'Request validation failed.',
      'support-id',
      [{ path: [], message: 'Unrecognized key: "photoIds"' }],
    );
    expect(errorDescription(error)).toEqual({
      title: 'Update needed',
      message:
        'The running backend does not support multiple photos yet. Update and restart the backend, then try again.',
      details: [],
    });
    expect(errorMessage(error)).not.toContain('support-id');
    expect(error.requestId).toBe('support-id');
  });
  it('names each invalid field and makes required values, limits and selections understandable', () => {
    const error = new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed.', undefined, [
      { path: ['number'], message: 'Invalid input: expected string, received undefined' },
      { path: ['photoIds'], message: 'Too big: expected array to have <=5 items' },
      { path: ['featureImages', 0, 'imageId'], message: 'Invalid UUID' },
      { path: ['name'], message: 'Too small: expected string to have >=12 characters' },
      { path: ['email'], message: 'Invalid email address' },
    ]);
    expect(errorDescription(error).details).toEqual([
      'Property number: Enter a value.',
      'Photos: Choose no more than 5 items.',
      'Feature photos / Item 1 / Photo: Choose a valid photo.',
      'Name: Enter at least 12 characters.',
      'Email address: Enter a valid email address.',
    ]);
    expect(validationDetails(error)[0]).toEqual({ path: ['number'], message: 'Enter a value.' });
    expect(errorMessage(error)).toContain('Property number: Enter a value.');
  });
  it('preserves useful business errors and uncertain write guidance', () => {
    const message = 'The selected property is already reserved.';
    expect(errorMessage(new ApiError(409, 'UNIT_UNAVAILABLE', message))).toBe(message);
    const uncertain =
      'Connection interrupted. The result is uncertain. Check the record before submitting again.';
    expect(errorMessage(new ApiError(0, 'NETWORK_ERROR', uncertain))).toBe(uncertain);
    expect(
      errorMessage(new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')),
    ).toBe('Email or password is incorrect.');
  });
  it('handles missing validation details, general service failures and duplicate records', () => {
    expect(
      errorMessage(new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed.')),
    ).toContain('Check the form');
    expect(
      errorMessage(new ApiError(500, 'INTERNAL_ERROR', 'The request could not be completed.')),
    ).toContain('Try again shortly');
    expect(
      errorMessage(new ApiError(409, 'DUPLICATE_RECORD', 'A conflicting record already exists.')),
    ).toContain('change the duplicate details');
    const malformed = new ApiError(422, 'VALIDATION_ERROR', 'Request validation failed.');
    Object.assign(malformed, { details: { invalid: true } });
    expect(() => errorDescription(malformed)).not.toThrow();
  });
});
