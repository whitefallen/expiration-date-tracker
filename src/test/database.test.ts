import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db, type Product } from '../db/database'

describe('Database CRUD Operations', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.products.clear()
  })

  afterEach(async () => {
    // Clean up after each test
    await db.products.clear()
  })

  it('should create a new product', async () => {
    const product: Omit<Product, 'id'> = {
      name: 'Test Lipstick',
      category: 'Makeup - Lips',
      expirationDate: new Date('2025-12-31'),
      brand: 'Test Brand',
      barcode: '1234567890',
      notes: 'Test notes',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const id = await db.products.add(product as Product)
    expect(id).toBeDefined()
    expect(typeof id).toBe('number')

    const savedProduct = await db.products.get(id)
    expect(savedProduct).toBeDefined()
    expect(savedProduct?.name).toBe('Test Lipstick')
    expect(savedProduct?.category).toBe('Makeup - Lips')
  })

  it('should read all products', async () => {
    const products: Omit<Product, 'id'>[] = [
      {
        name: 'Foundation',
        category: 'Makeup - Face',
        expirationDate: new Date('2025-06-30'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mascara',
        category: 'Makeup - Eyes',
        expirationDate: new Date('2025-03-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.products.bulkAdd(products as Product[])

    const allProducts = await db.products.toArray()
    expect(allProducts).toHaveLength(2)
    expect(allProducts[0].name).toBe('Foundation')
    expect(allProducts[1].name).toBe('Mascara')
  })

  it('should update an existing product', async () => {
    const product: Omit<Product, 'id'> = {
      name: 'Old Name',
      category: 'Makeup - Face',
      expirationDate: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const id = await db.products.add(product as Product)

    await db.products.update(id, {
      name: 'Updated Name',
      updatedAt: new Date(),
    })

    const updatedProduct = await db.products.get(id)
    expect(updatedProduct?.name).toBe('Updated Name')
    expect(updatedProduct?.category).toBe('Makeup - Face')
  })

  it('should delete a product', async () => {
    const product: Omit<Product, 'id'> = {
      name: 'To Be Deleted',
      category: 'Makeup - Lips',
      expirationDate: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const id = await db.products.add(product as Product)

    let savedProduct = await db.products.get(id)
    expect(savedProduct).toBeDefined()

    await db.products.delete(id)

    savedProduct = await db.products.get(id)
    expect(savedProduct).toBeUndefined()
  })

  it('should query products by category', async () => {
    const products: Omit<Product, 'id'>[] = [
      {
        name: 'Lipstick',
        category: 'Makeup - Lips',
        expirationDate: new Date('2025-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Foundation',
        category: 'Makeup - Face',
        expirationDate: new Date('2025-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Lip Gloss',
        category: 'Makeup - Lips',
        expirationDate: new Date('2025-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.products.bulkAdd(products as Product[])

    const lipProducts = await db.products
      .where('category')
      .equals('Makeup - Lips')
      .toArray()

    expect(lipProducts).toHaveLength(2)
    expect(lipProducts.every((p) => p.category === 'Makeup - Lips')).toBe(true)
  })

  it('should sort products by expiration date', async () => {
    const products: Omit<Product, 'id'>[] = [
      {
        name: 'Product 1',
        category: 'Makeup - Face',
        expirationDate: new Date('2025-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Product 2',
        category: 'Makeup - Face',
        expirationDate: new Date('2025-06-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Product 3',
        category: 'Makeup - Face',
        expirationDate: new Date('2025-03-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.products.bulkAdd(products as Product[])

    const sortedProducts = await db.products
      .orderBy('expirationDate')
      .toArray()

    expect(sortedProducts[0].name).toBe('Product 3')
    expect(sortedProducts[1].name).toBe('Product 2')
    expect(sortedProducts[2].name).toBe('Product 1')
  })
})
