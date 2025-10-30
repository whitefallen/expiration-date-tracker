import Dexie, { type Table } from 'dexie';

export interface Product {
  id?: number;
  name: string;
  category: string;
  expirationDate: Date;
  purchaseDate?: Date;
  barcode?: string;
  brand?: string;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ExpirationDatabase extends Dexie {
  products!: Table<Product>;

  constructor() {
    super('ExpirationTrackerDB');
    this.version(1).stores({
      products: '++id, name, category, expirationDate, barcode, createdAt',
    });
  }
}

export const db = new ExpirationDatabase();
