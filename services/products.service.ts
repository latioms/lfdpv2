import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { ProductRecord } from "./types";

export class ProductsService extends BaseService<ProductRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'products');
  }

  async getAll(): Promise<ProductRecord[]> {
    try {
      return await this.powerSync.getAll(`
        SELECT p.*, s.name as supplier_name 
        FROM products p 
        LEFT JOIN suppliers s ON p.supplier = s.id 
        ORDER BY p.created_at DESC
      `);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  async create(product: Omit<ProductRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ProductRecord> {
    const id = crypto.randomUUID();
    const now = this.formatDate();
    const newProduct = {
      id,
      ...product,
      created_at: now,
      updated_at: now
    };

    try {
      await this.powerSync.execute(
        `INSERT INTO products (
          id, name, description, price, stock_quantity, 
          alert_threshold, category_id, supplier, image_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, product.name, product.description, product.price,
          product.stock_quantity, product.alert_threshold,
          product.category_id, product.supplier,
          product.image_url, now, now
        ]
      );

      return newProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async update(id: string, product: Partial<Omit<ProductRecord, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const now = this.formatDate();
    
    try {
      const updates = Object.entries(product)
        .filter(([, value]) => value !== undefined)
        .map(([key]) => `${key} = ?`)
        .join(', ');

      const values = Object.entries(product)
        .filter(([, value]) => value !== undefined)
        .map(([, value]) => value);

      await this.powerSync.execute(
        `UPDATE products SET ${updates}, updated_at = ? WHERE id = ?`,
        [...values, now, id]
      );
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  }

  async canDelete(id: string): Promise<{ can: boolean; reason?: string }> {
    try {
      const orderItems = await this.powerSync.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
        [id]
      );

      if (orderItems && orderItems.count > 0) {
        return {
          can: false,
          reason: `Ce produit est utilisé dans ${orderItems.count} commande(s) et ne peut pas être supprimé.`
        };
      }

      return { can: true };
    } catch (error) {
      console.error('Failed to check product dependencies:', error);
      throw error;
    }
  }

  async safeDelete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const check = await this.canDelete(id);
      
      if (!check.can) {
        return { 
          success: false, 
          message: check.reason || 'Le produit ne peut pas être supprimé'
        };
      }

      await this.powerSync.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );

      return {
        success: true,
        message: 'Produit supprimé avec succès'
      };
    } catch (error) {
      console.error('Failed to delete product:', error);
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
      return { success: false, message };
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
        `SELECT p.*, s.name as supplier_name 
         FROM products p 
         LEFT JOIN suppliers s ON p.supplier_id = s.id 
         WHERE p.name LIKE ? OR p.description LIKE ? 
         ORDER BY p.name`,
        [`%${query}%`, `%${query}%`]
      );
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }
}