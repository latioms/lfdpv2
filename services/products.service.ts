import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { ProductRecord } from "./types";

export class ProductsService extends BaseService<ProductRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'products');
  }

  async create(product: Omit<ProductRecord, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const id = crypto.randomUUID();
      const now = this.formatDate();
      await this.powerSync.execute(
        `INSERT INTO products (
          id, name, description, price, stock_quantity, 
          alert_threshold, category_id, image_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, product.name, product.description, product.price,
          product.stock_quantity, product.alert_threshold,
          product.category_id, product.image_url, now, now
        ]
      );
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async update(id: string, product: Partial<Omit<ProductRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    try {
      const updates = Object.entries(product)
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => `${key} = ?`)
        .join(', ');

      const values = Object.entries(product)
        .filter(([_, value]) => value !== undefined)
        .map(([_, value]) => value);

      await this.powerSync.execute(
        `UPDATE products SET ${updates}, updated_at = ? WHERE id = ?`,
        [...values, this.formatDate(), id]
      );
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async getByCategory(categoryId: string): Promise<ProductRecord[]> {
    try {
      return await this.powerSync.getAll(
        'SELECT * FROM products WHERE category_id = ? ORDER BY name',
        [categoryId]
      );
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      throw error;
    }
  }

  async getLowStock(): Promise<ProductRecord[]> {
    try {
      return await this.powerSync.getAll(
        'SELECT * FROM products WHERE stock_quantity <= alert_threshold'
      );
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
      throw error;
    }
  }

  async search(query: string): Promise<ProductRecord[]> {
    try {
      return await this.powerSync.getAll(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY name',
        [`%${query}%`, `%${query}%`]
      );
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }
} 