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

export const inventoryTemplate =
  'number,type,area,price,charges,phase,block,sector,tower,floor,typeDetails,features\nA-001,RESIDENTIAL_PLOT,5 marla,"3,500,000.00",0,Phase 1,A,,,,,Corner plot;Park facing\nA-002,APARTMENT,1200 sq ft,"12,000,000",0,Phase 1,B,,Tower 1,2,,Parking;Lift\n';
export function prepareInventoryRows(rows: Record<string, string>[]) {
  const seen = new Set<string>();
  return rows.map((source, index) => {
    const record: Record<string, unknown> = { ...source };
    const line = index + 2;
    if (record.area) {
      if (record.size || record.measurementUnit)
        throw new Error(`Row ${line}: use area, or size and measurementUnit, not both.`);
      const parsed = String(record.area).match(
        /^(\d+(?:\.\d{1,2})?)\s+(marla|kanal|sq ft|sq yd|sq m|acre|hectare)$/i,
      );
      if (!parsed) throw new Error(`Row ${line}: enter an area such as 5 marla or 1200 sq ft.`);
      record.size = parsed[1];
      record.measurementUnit = parsed[2]!.toLowerCase();
    }
    delete record.area;
    for (const key of ['price', 'charges'])
      if (record[key]) {
        const value = String(record[key]);
        if (!/^(?:\d+|\d{1,3}(?:,\d{3})+|\d{1,2}(?:,\d{2})*,\d{3})(?:\.\d{1,2})?$/.test(value))
          throw new Error(`Row ${line}: ${key} must be an amount such as 100000 or 100,000.00.`);
        record[key] = value.replaceAll(',', '');
      }
    if (typeof record.features === 'string')
      record.features = record.features
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
    const number = String(record.number ?? '').trim();
    if (seen.has(number)) throw new Error(`Row ${line}: duplicate property number ${number}.`);
    seen.add(number);
    return record;
  });
}
