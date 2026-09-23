// RFC 4180 fields, including escaped quotes and embedded newlines. Values remain strings.
export function parseCsv(source: string): Record<string, string>[] {
  const text = source.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let record: string[] = [],
    value = '',
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        value += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        closed = true;
      } else value += c;
    } else if (c === '"') {
      if (value || closed) throw new Error('Unexpected quote in CSV.');
      quoted = true;
    } else if (c === ',' || c === '\n' || c === '\r') {
      record.push(value);
      value = '';
      closed = false;
      if (c !== ',') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        if (record.some(Boolean)) rows.push(record);
        record = [];
      }
    } else {
      if (closed) throw new Error('Unexpected text after a quoted CSV field.');
      value += c;
    }
  }
  if (quoted) throw new Error('Unclosed quote in CSV.');
  record.push(value);
  if (record.some(Boolean)) rows.push(record);
  const headers = rows.shift()?.map((h) => h.trim());
  if (!headers?.length || headers.some((h) => !h) || new Set(headers).size !== headers.length)
    throw new Error('CSV headers must be present and unique.');
  if (rows.length < 1 || rows.length > 500) throw new Error('Include between 1 and 500 units.');
  return rows.map((cells, index) => {
    if (cells.length !== headers.length)
      throw new Error(`CSV row ${index + 2} has an incorrect number of fields.`);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]!.trim()]));
  });
}
