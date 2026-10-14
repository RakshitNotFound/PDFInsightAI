import { useCallback, useState } from 'react';
import { parseDocument } from '../utils/parseDocument';
import { extractMetrics, SAMPLE_REPORT } from '../utils/extractMetrics';

export function useDocumentParser() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const analyze = useCallback(async (file) => {
    setError('');
    setStatus('parsing');
    setProgress(8);
    try {
      const document = await parseDocument(file, ({ progress: next }) => setProgress(next));
      setParsed(document);
      setMetrics(extractMetrics(document));
      setStatus('ready');
      setProgress(100);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to parse the file.');
      setParsed(null);
      setMetrics(null);
    }
  }, []);

  const loadSample = useCallback(() => {
    setError('');
    setParsed(SAMPLE_REPORT);
    setMetrics(extractMetrics(SAMPLE_REPORT));
    setStatus('ready');
    setProgress(100);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError('');
    setParsed(null);
    setMetrics(null);
  }, []);

  return { status, progress, error, parsed, metrics, analyze, loadSample, reset };
}
