const NUMBER_PATTERN = /[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?/g;
const LABELED_VALUE_PATTERN =
  /([A-Za-z][A-Za-z0-9 &/().%-]{1,48}?)\s*[:|=]\s*([$€£]?\s*[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?%?)/g;
const YEAR_PATTERN = /\b(19|20)\d{2}\b/;

function parseNumeric(raw) {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/[$€£,\s]/g, '');
  if (!cleaned || cleaned === '-' || cleaned === '+') return null;
  const isPercent = cleaned.endsWith('%');
  const value = Number.parseFloat(isPercent ? cleaned.slice(0, -1) : cleaned);
  if (!Number.isFinite(value)) return null;
  return { value, isPercent, raw: String(raw).trim() };
}

function uniqueKey(base, used) {
  let key = base;
  let n = 2;
  while (used.has(key)) {
    key = `${base} (${n})`;
    n += 1;
  }
  used.add(key);
  return key;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40) || 'metric';
}

function extractLabeledValues(text) {
  const used = new Set();
  const rows = [];
  let match;
  const regex = new RegExp(LABELED_VALUE_PATTERN.source, 'g');

  while ((match = regex.exec(text)) !== null) {
    const label = match[1].replace(/\s+/g, ' ').trim();
    const parsed = parseNumeric(match[2]);
    if (!parsed || label.length < 2) continue;
    if (/^(page|fig|figure|table)$/i.test(label)) continue;
    rows.push({
      id: uniqueKey(slugify(label), used),
      label,
      value: parsed.value,
      raw: parsed.raw,
      isPercent: parsed.isPercent,
    });
  }

  return rows;
}

function extractTableRows(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const tables = [];
  let buffer = [];

  const flush = () => {
    if (buffer.length >= 2) tables.push(buffer);
    buffer = [];
  };

  lines.forEach((line) => {
    const cells = line.split(/[\t|,;]|(?:\s{2,})/).map((cell) => cell.trim()).filter(Boolean);
    const numericCells = cells.filter((cell) => parseNumeric(cell));
    if (cells.length >= 2 && numericCells.length >= 1) {
      buffer.push(cells);
    } else {
      flush();
    }
  });
  flush();

  return tables.flatMap((table) => {
    const headerLooksText = table[0].every((cell) => !parseNumeric(cell) || YEAR_PATTERN.test(cell));
    const headers = headerLooksText
      ? table[0]
      : table[0].map((_, index) => (index === 0 ? 'Label' : `Col ${index}`));
    const body = headerLooksText ? table.slice(1) : table;

    return body
      .map((cells) => {
        const label = cells[0];
        const values = cells.slice(1).map((cell, index) => {
          const parsed = parseNumeric(cell);
          return {
            header: headers[index + 1] || `Col ${index + 1}`,
            value: parsed?.value ?? null,
            raw: cell,
          };
        });
        const numeric = values.filter((item) => item.value != null);
        if (!label || numeric.length === 0) return null;
        return { label, values: numeric };
      })
      .filter(Boolean);
  });
}

function buildCharts(labeled, tables, allNumbers) {
  const charts = [];

  if (labeled.length >= 2) {
    const top = [...labeled]
      .filter((row) => !row.isPercent)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 10);

    if (top.length >= 2) {
      charts.push({
        id: 'labeled-bar',
        title: 'Key metrics',
        type: 'bar',
        labels: top.map((row) => row.label),
        datasets: [
          {
            label: 'Value',
            data: top.map((row) => row.value),
          },
        ],
      });
    }

    const percents = labeled.filter((row) => row.isPercent).slice(0, 8);
    if (percents.length >= 2) {
      charts.push({
        id: 'percent-doughnut',
        title: 'Percentage metrics',
        type: 'doughnut',
        labels: percents.map((row) => row.label),
        datasets: [
          {
            label: '%',
            data: percents.map((row) => row.value),
          },
        ],
      });
    }
  }

  if (tables.length) {
    const grouped = new Map();
    tables.forEach((row) => {
      row.values.forEach((cell) => {
        if (!grouped.has(cell.header)) grouped.set(cell.header, []);
        grouped.get(cell.header).push({ label: row.label, value: cell.value });
      });
    });

    const seriesKeys = [...grouped.keys()].slice(0, 4);
    const labels = [...new Set(tables.map((row) => row.label))].slice(0, 12);
    if (labels.length >= 2 && seriesKeys.length >= 1) {
      const looksTemporal = labels.every((label) => YEAR_PATTERN.test(label) || /Q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(label));
      charts.push({
        id: 'table-series',
        title: looksTemporal ? 'Trend from extracted table' : 'Table comparison',
        type: looksTemporal ? 'line' : 'bar',
        labels,
        datasets: seriesKeys.map((key) => ({
          label: key,
          data: labels.map((label) => {
            const match = grouped.get(key)?.find((item) => item.label === label);
            return match?.value ?? 0;
          }),
        })),
      });
    }
  }

  if (!charts.length && allNumbers.length >= 4) {
    const sample = allNumbers.slice(0, 16);
    charts.push({
      id: 'numeric-sequence',
      title: 'Numeric sequence in document',
      type: 'line',
      labels: sample.map((_, index) => `#${index + 1}`),
      datasets: [
        {
          label: 'Detected values',
          data: sample,
        },
      ],
    });
  }

  return charts;
}

export function extractMetrics(parsed) {
  const text = parsed?.text || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const labeled = extractLabeledValues(text);
  const tables = extractTableRows(text);
  const allNumbers = [...text.matchAll(NUMBER_PATTERN)]
    .map((match) => parseNumeric(match[0])?.value)
    .filter((value) => typeof value === 'number');

  const uniqueNumbers = [...new Set(allNumbers.map((n) => Number(n.toFixed(4))))];
  const sum = allNumbers.reduce((acc, n) => acc + n, 0);
  const avg = allNumbers.length ? sum / allNumbers.length : 0;
  const min = allNumbers.length ? Math.min(...allNumbers) : 0;
  const max = allNumbers.length ? Math.max(...allNumbers) : 0;

  const tableExport = [];
  labeled.forEach((row) => {
    tableExport.push({
      Category: 'Labeled metric',
      Label: row.label,
      Value: row.value,
      Raw: row.raw,
    });
  });
  tables.forEach((row) => {
    row.values.forEach((cell) => {
      tableExport.push({
        Category: 'Table',
        Label: row.label,
        Column: cell.header,
        Value: cell.value,
        Raw: cell.raw,
      });
    });
  });

  if (!tableExport.length && allNumbers.length) {
    allNumbers.slice(0, 200).forEach((value, index) => {
      tableExport.push({
        Category: 'Detected number',
        Label: `Value ${index + 1}`,
        Value: value,
        Raw: String(value),
      });
    });
  }

  return {
    summary: {
      fileName: parsed.fileName,
      kind: parsed.kind,
      pageCount: parsed.pageCount || 1,
      fileSize: parsed.fileSize || 0,
      wordCount: words,
      numberCount: allNumbers.length,
      uniqueNumberCount: uniqueNumbers.length,
      labeledMetricCount: labeled.length,
      tableRowCount: tables.length,
      sum,
      avg,
      min,
      max,
    },
    labeled,
    tables,
    numbers: allNumbers,
    charts: buildCharts(labeled, tables, allNumbers),
    tableExport,
    preview: text.slice(0, 4000),
    fullText: text,
  };
}

export const SAMPLE_REPORT = {
  fileName: 'sample-quarterly-report.txt',
  fileSize: 1840,
  kind: 'text',
  parsedAt: new Date().toISOString(),
  pageCount: 1,
  pages: [{ pageNumber: 1, text: '' }],
  text: `PDFInsightsAI Quarterly Performance Report
Period: Q1 2025 through Q4 2025

Revenue: 1240000
Gross Profit: 486000
Operating Expenses: 312000
Net Income: 174000
Customer Retention: 92%
Gross Margin: 39.2%
Churn Rate: 4.8%
NPS: 61

Quarter, Revenue, New Customers, Support Tickets
Q1 2025, 280000, 420, 118
Q2 2025, 305000, 465, 132
Q3 2025, 318000, 490, 141
Q4 2025, 337000, 512, 126

Region | Sales | Headcount
North | 410000 | 18
South | 295000 | 12
East | 322000 | 15
West | 213000 | 9
`,
};

SAMPLE_REPORT.pages[0].text = SAMPLE_REPORT.text;
