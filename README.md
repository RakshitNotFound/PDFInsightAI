# PDFInsightsAI

Client-side React + Vite + Tailwind dashboard that parses PDF and text files in the browser, auto-charts extracted metrics, and exports Excel workbooks. Nothing leaves the machine.

## Stack

- React 18, Vite 6, Tailwind CSS 3
- `pdfjs-dist` for local PDF text extraction
- Chart.js + `react-chartjs-2` for responsive charts
- SheetJS (`xlsx`) for `.xlsx` export
- `lucide-react` icons

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Usage

1. Drop a PDF, TXT, MD, or CSV file, click **Load sample report**, or try `public/sample-report.pdf`.
2. Review summary cards, auto-generated charts, and the extracted table.
3. Click **Export Excel** to download a workbook with Summary, Extracted Data, and Raw Text sheets.

Parsing, charting, and export all run in the browser. There is no backend.
