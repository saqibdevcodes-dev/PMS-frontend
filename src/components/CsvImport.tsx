import { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { parseCsv } from '../lib/csv';
import { normalize, validator } from '../lib/schema';
import type { JsonSchema, Row } from '../lib/types';
import { Button, ErrorState } from './ui';
export function CsvImport({
  schema,
  onReady,
}: {
  schema: JsonSchema;
  onReady: (body: Row) => void;
}) {
  const [error, setError] = useState<unknown>();
  return (
    <div className="csv-import">
      <div>
        <strong>Import from a CSV file</strong>
        <p className="muted">Up to 500 units. You can review the records before saving.</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          const url = URL.createObjectURL(
            new Blob(
              [
                'number,type,size,measurementUnit,price,phase,block,charges\nA-001,RESIDENTIAL_PLOT,5,marla,3500000.00,Phase 1,A,0.00\n',
              ],
              { type: 'text/csv' },
            ),
          );
          const a = document.createElement('a');
          a.href = url;
          a.download = 'inventory-template.csv';
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }}
      >
        <Download size={15} />
        CSV template
      </Button>
      <label className="btn btn-secondary">
        <Upload size={15} />
        Choose CSV
        <input
          type="file"
          accept=".csv,text/csv"
          className="visually-hidden"
          onChange={async (e) => {
            setError(undefined);
            try {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 2 * 1024 * 1024)
                throw new Error('Use a CSV file smaller than 2 MiB.');
              const rows = parseCsv(await file.text());
              const allowed = new Set(
                Object.keys(schema.properties?.units?.items?.properties ?? {}),
              );
              const unsupported = Object.keys(rows[0] ?? {}).filter((k) => !allowed.has(k));
              if (unsupported.length) throw new Error('Unknown columns: ' + unsupported.join(', '));
              const result = validator(schema).safeParse(normalize(schema, { units: rows }));
              if (!result.success)
                throw new Error(
                  result.error.issues
                    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                    .slice(0, 5)
                    .join('\n'),
                );
              onReady(result.data as Row);
            } catch (err) {
              setError(err);
            } finally {
              e.target.value = '';
            }
          }}
        />
      </label>
      {Boolean(error) && <ErrorState error={error} />}
    </div>
  );
}
