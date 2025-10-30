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
    // Initialize with both English and German language support for better European date recognition
    this.worker = await createWorker(['eng', 'deu']);
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
    
    // Common date patterns for expiration dates (European/German format focus)
    const patterns = [
      // German/European formats (DD.MM.YYYY is most common in Germany)
      /\d{2}\.\d{2}\.\d{4}/g, // DD.MM.YYYY (German standard)
      /\d{2}\.\d{4}/g, // MM.YYYY (German short format)
      
      // Also support slash and hyphen separators
      /\d{2}[/.\\-]\d{2}[/.\\-]\d{4}/g, // DD/MM/YYYY or DD-MM-YYYY
      /\d{2}[/.\\-]\d{4}/g, // MM/YYYY or MM-YYYY
      
      // ISO format
      /\d{4}[/.\\-]\d{2}[/.\\-]\d{2}/g, // YYYY/MM/DD or YYYY-MM-DD
      
      // With "MHD" (Mindesthaltbarkeitsdatum - German for expiration date) or "EXP" prefix
      /MHD[:\s]*\d{2}\.\d{2}\.\d{4}/gi, // MHD: DD.MM.YYYY
      /MHD[:\s]*\d{2}\.\d{4}/gi, // MHD: MM.YYYY
      /EXP[:\s]*\d{2}[/.\\-]\d{2}[/.\\-]\d{4}/gi, // EXP: DD/MM/YYYY
      /EXP[:\s]*\d{2}[/.\\-]\d{4}/gi, // EXP: MM/YYYY
      
      // German month names
      /\d{2}[\s.]+(?:JAN|FEB|MÄR|APR|MAI|JUN|JUL|AUG|SEP|OKT|NOV|DEZ)[\s.]+\d{4}/gi, // DD MMM YYYY (German)
      
      // English month names (for international products)
      /\d{2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\d{4}/gi, // DD MMM YYYY (English)
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
