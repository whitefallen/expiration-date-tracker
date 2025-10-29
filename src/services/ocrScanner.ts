import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  possibleDates: string[];
}

export class OCRScanner {
  private static worker: Awaited<ReturnType<typeof createWorker>> | null = null;

  static async initialize(): Promise<void> {
    if (this.worker) return;
    this.worker = await createWorker('eng');
  }

  static async scanImage(image: File | string): Promise<OCRResult> {
    if (!this.worker) {
      await this.initialize();
    }

    const {
      data: { text, confidence },
    } = await this.worker!.recognize(image);

    // Extract potential dates from text
    const possibleDates = this.extractDates(text);

    return {
      text,
      confidence,
      possibleDates,
    };
  }

  private static extractDates(text: string): string[] {
    const dates: string[] = [];
    
    // Common date patterns for expiration dates
    const patterns = [
      /\d{2}[/.\\-]\d{2}[/.\\-]\d{4}/g, // DD/MM/YYYY or MM/DD/YYYY
      /\d{2}[/.\\-]\d{4}/g, // MM/YYYY
      /\d{4}[/.\\-]\d{2}[/.\\-]\d{2}/g, // YYYY/MM/DD
      /EXP[:\s]*\d{2}[/.\\-]\d{2}[/.\\-]\d{4}/gi, // EXP: DD/MM/YYYY
      /EXP[:\s]*\d{2}[/.\\-]\d{4}/gi, // EXP: MM/YYYY
      /\d{2}\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4}/gi, // DD MMM YYYY
    ];

    patterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    });

    return [...new Set(dates)]; // Remove duplicates
  }

  static async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
