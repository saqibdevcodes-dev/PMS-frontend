import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import messages from '../../src/lib/translations.json';
import { t } from '../../src/lib/i18n';
import { humanize } from '../../src/lib/format';
import { usePreferences } from '../../src/stores/preferences';
import {
  fieldLabels,
  fieldHelp,
  featureOptions,
  roleDescriptions,
} from '../../src/lib/form-guidance';
import { resources, actionTitle } from '../../src/features/resources/catalog';
import { operations } from '../../src/lib/contract';
import { normalize, validator } from '../../src/lib/schema';

beforeEach(() => usePreferences.getState().setLanguage('en'));
describe('English, Urdu and Arabic interface', () => {
  it('switches language without translating record data or API values', () => {
    expect(t('Property area')).toBe('Property area');
    for (const language of ['ur', 'ar'] as const) {
      usePreferences.getState().setLanguage(language);
      expect(t('Property area')).not.toBe('Property area');
      expect(humanize('BANK_TRANSFER')).not.toBe('Bank transfer');
      expect(t('Welcome, {0}', { '0': 'Ahmed A-104' })).toContain('Ahmed A-104');
      expect(t('A-104')).toBe('A-104');
    }
  });
  it('has both translations for static UI text, field guidance, roles and resource actions', () => {
    const dictionary = messages as Record<string, string[]>;
    const keys = new Set(Object.keys(dictionary).map((k) => k.toLowerCase()));
    const expected = new Set<string>([
      ...Object.values(fieldLabels),
      ...Object.values(fieldHelp).flat(),
      ...featureOptions,
      ...Object.values(roleDescriptions),
    ]);
    for (const resource of resources) {
      expected.add(resource.label);
      expected.add(resource.description);
      expected.add(resource.group);
      for (const method of ['post', 'patch']) {
        const op = operations.find(
          (o) =>
            o.method === method &&
            o.path === (resource.global ? '' : '/projects/{projectId}') + '/' + resource.api,
        );
        if (op) expected.add(actionTitle(op, resource));
      }
    }
    function scan(directory: string) {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, item.name);
        if (item.isDirectory()) {
          if (item.name !== 'generated') scan(file);
          continue;
        }
        if (!/\.tsx?$/.test(file)) continue;
        const source = ts.createSourceFile(
          file,
          readFileSync(file, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
          file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
        );
        function visit(node: ts.Node) {
          if (
            ts.isCallExpression(node) &&
            node.expression.getText(source) === 't' &&
            node.arguments[0] &&
            ts.isStringLiteral(node.arguments[0])
          )
            expected.add(node.arguments[0].text);
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
    scan('src');
    expect(
      [...expected].filter(
        (key) => key && !keys.has(key.replace(/\s+/g, ' ').trim().toLowerCase()),
      ),
    ).toEqual([]);
    for (const values of Object.values(dictionary)) {
      expect(values).toHaveLength(2);
      expect(values.every((v) => v.trim().length > 0)).toBe(true);
    }
  });
  it('keeps generated API enum values and translated area choices separate', () => {
    const operation = operations.find(
      (o) => o.method === 'post' && o.path === '/projects/{projectId}/units',
    )!;
    expect(operation.body?.properties?.measurementUnit?.enum).toEqual([
      'marla',
      'kanal',
      'sq ft',
      'sq yd',
      'sq m',
      'acre',
      'hectare',
    ]);
    usePreferences.getState().setLanguage('ur');
    expect(humanize('sq ft')).toBe('مربع فٹ');
    expect(operation.body?.properties?.type?.enum).toContain('OTHER');
  });
  it('can edit legacy records with no photo and explicitly clear a project photo', () => {
    const schema = operations.find(
      (o) => o.method === 'patch' && o.path === '/projects/{projectId}',
    )!.body!;
    const cleared = normalize(schema, { photoId: '', name: 'Garden Homes' });
    expect(cleared).toMatchObject({ photoId: null, name: 'Garden Homes' });
    expect(validator(schema).safeParse(cleared).success).toBe(true);
    expect(validator(schema).safeParse({ photoId: 'invalid' }).success).toBe(false);
    expect(
      normalize({ type: 'object', properties: { notes: { type: 'string' } } }, { notes: null }),
    ).toEqual({});
  });
});
