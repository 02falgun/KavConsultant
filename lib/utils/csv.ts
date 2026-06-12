export function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) {
    return [] as Record<string, string>[];
  }

  const headers = lines[0].split(',').map((header) => header.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',');
    return headers.reduce<Record<string, string>>((record, header, index) => {
      record[header] = (values[index] ?? '').trim();
      return record;
    }, {});
  });
}

export function toCsv(rows: Record<string, unknown>[], headers: string[]) {
  const csvRows = [headers.join(',')];
  for (const row of rows) {
    csvRows.push(headers.map((header) => JSON.stringify(row[header] ?? '')).join(','));
  }
  return csvRows.join('\n');
}
