'use client';

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { toast } from 'sonner';

// Initialize PDF.js worker (client-side only)
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();
}

interface PDFConverterOptions {
  file: File;
  onComplete: (text: string, title: string) => void;
  onError: (error: string) => void;
  onProgress: (message: string) => void;
  authToken: string;
}

export class PDFConverter {
  private file: File;
  private onComplete: (text: string, title: string) => void;
  private onError: (error: string) => void;
  private onProgress: (message: string) => void;
  private authToken: string;

  constructor(options: PDFConverterOptions) {
    this.file = options.file;
    this.onComplete = options.onComplete;
    this.onError = options.onError;
    this.onProgress = options.onProgress;
    this.authToken = options.authToken;
  }

  async convert() {
    try {
      this.onProgress('Extracting text from PDF...');
      
      // Extract text on the client side
      const pdfData = await this.file.arrayBuffer();
      const pdf = await getDocument(pdfData).promise;
      const pageCount = pdf.numPages;
      let text = '';
      
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => (item as { str: string }).str + ((item as { str: string }).str.endsWith('-') ? '' : ' '))
          .join('')
          .trim();
        text += pageText + '\n\n';
      }

      this.onProgress('Processing extracted text...');
      
      // Send extracted text to server
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ text: text.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      this.onProgress('Processing complete!');
      this.onComplete(result.text, result.title);

    } catch (error) {
      console.error('PDF conversion error:', error);
      const message = error instanceof Error ? error.message : 'Failed to convert PDF';
      this.onError(message);
      toast.error(message);
    }
  }
} 