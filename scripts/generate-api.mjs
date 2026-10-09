import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';
let source = new URL('../../BE/docs/openapi.json', import.meta.url);
try {
  await access(source);
} catch {
  source = new URL('../../PMS-BE/docs/openapi.json', import.meta.url);
}
const spec = JSON.parse(await readFile(source, 'utf8'));
await mkdir(new URL('../src/generated/', import.meta.url), { recursive: true });
const operations = [];
for (const [path, methods] of Object.entries(spec.paths))
  for (const [method, operation] of Object.entries(methods)) {
    const content = operation.requestBody?.content;
    operations.push({
      id: operation.operationId,
      path,
      method,
      summary: operation.summary,
      permission: operation['x-permission'] ?? undefined,
      public: operation.security?.length === 0,
      body: content?.['application/json']?.schema ?? content?.['multipart/form-data']?.schema,
      parameters: operation.parameters ?? [],
      multipart: Boolean(content?.['multipart/form-data']),
    });
  }
await writeFile(
  new URL('../src/generated/api.d.ts', import.meta.url),
  astToString(await openapiTS(spec)),
);
await writeFile(
  new URL('../src/generated/operations.json', import.meta.url),
  JSON.stringify(operations, null, 2) + '\n',
);
console.log(`Generated types and ${operations.length} operations from the backend contract.`);
