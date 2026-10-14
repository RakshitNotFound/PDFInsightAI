import { useCallback, useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import { isSupportedFile } from '../utils/parseDocument';

export default function FileUploader({ onFile, disabled, progress, status }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) return;
      if (!isSupportedFile(file)) {
        onFile(file);
        return;
      }
      onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 transition ${
        isDragging
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40'
          : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold">Drop a PDF or text file</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Parsing happens entirely in your browser. Nothing is uploaded to a server.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            Browse files
          </button>
          <span className="text-xs text-slate-400">PDF, TXT, MD, CSV</span>
        </div>
        {status === 'parsing' && (
          <div className="mt-6 w-full max-w-sm">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Extracting text locally</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.log,application/pdf,text/plain,text/csv,text/markdown"
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
