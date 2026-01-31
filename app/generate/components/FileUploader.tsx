'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Extensions + MIME types so mobile and desktop both open the right picker
const ACCEPT = '.pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword';
const MAX_MB = 10;

interface FileUploaderProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
  onError?: (message: string) => void;
}

export function FileUploader({ onTextExtracted, disabled, onError }: FileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';

      if (file.size > MAX_MB * 1024 * 1024) {
        onError?.(`File too large. Max ${MAX_MB}MB.`);
        return;
      }

      setExtracting(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch(`${base}/api/extract-file`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          onError?.(data.error ?? 'Failed to extract text from file.');
          return;
        }
        if (!data.text || String(data.text).trim().length < 50) {
          onError?.('Could not extract enough text from the file. Try pasting the content instead.');
          return;
        }
        onTextExtracted(data.text);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Failed to extract text from file.');
      } finally {
        setExtracting(false);
      }
    },
    [onTextExtracted, onError]
  );

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 border-dashed hover:border-foreground/30 hover:bg-muted/50 hover:shadow-sm',
        (disabled || extracting) && 'opacity-50 pointer-events-none'
      )}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleChange}
        disabled={disabled || extracting}
        className="sr-only"
        aria-label="Upload PDF or Word document"
      />
      <label
        htmlFor={inputId}
        className={cn(
          'flex flex-col cursor-pointer min-h-[120px]',
          (disabled || extracting) && 'pointer-events-none'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-6 text-center pointer-events-none">
        {extracting ? (
          <>
            <Loader2 className="w-10 h-10 text-foreground animate-spin mb-3" />
            <p className="font-medium text-foreground">Extracting text…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 transition-colors">
              <Upload className="w-6 h-6 text-foreground" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="font-medium text-foreground">Upload PDF or Word</span>
            </div>
            <p className="text-sm text-muted-foreground">Max {MAX_MB}MB · PDF, DOCX supported</p>
          </>
        )}
        </CardContent>
      </label>
    </Card>
  );
}
