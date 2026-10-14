import * as XLSX from 'xlsx';

function sheetFromRows(rows) {
  const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Message: 'No tabular data extracted' }]);
  const keys = rows.length ? Object.keys(rows[0]) : ['Message'];
  worksheet['!cols'] = keys.map((key) => ({
    wch: Math.min(
      48,
      Math.max(12, key.length, ...rows.slice(0, 80).map((row) => String(row[key] ?? '').length)),
    ),
  }));
  return worksheet;
}

export function exportMetricsToExcel(metrics, parsed) {
  if (!metrics) {
    throw new Error('Nothing to export yet. Parse a document first.');
  }

  const workbook = XLSX.utils.book_new();
  const summaryRows = Object.entries(metrics.summary).map(([key, value]) => ({
    Field: key,
    Value: value,
  }));

  XLSX.utils.book_append_sheet(workbook, sheetFromRows(summaryRows), 'Summary');
  XLSX.utils.book_append_sheet(workbook, sheetFromRows(metrics.tableExport), 'Extracted Data');

  if (metrics.labeled.length) {
    XLSX.utils.book_append_sheet(
      workbook,
      sheetFromRows(
        metrics.labeled.map((row) => ({
          Label: row.label,
          Value: row.value,
          Raw: row.raw,
          Percent: row.isPercent ? 'Yes' : 'No',
        })),
      ),
      'Labeled Metrics',
    );
  }

  const textRows = (parsed?.text || metrics.fullText || '')
    .split(/\r?\n/)
    .map((line, index) => ({ Line: index + 1, Text: line }));
  XLSX.utils.book_append_sheet(workbook, sheetFromRows(textRows.slice(0, 5000)), 'Raw Text');

  const stamp = new Date().toISOString().slice(0, 10);
  const base = (parsed?.fileName || 'document').replace(/\.[^.]+$/, '');
  XLSX.writeFile(workbook, `${base}-dashboard-${stamp}.xlsx`);
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
