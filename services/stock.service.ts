import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { StockMovementRecord } from "./types";

export class StockService extends BaseService<StockMovementRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'stock_movements');
  }

  async recordMovement(
    productId: string,
    quantity: number,
    type: StockMovementRecord['movement_type'],
    description?: string
  ): Promise<void> {
    try {
      const id = crypto.randomUUID();
      const now = this.formatDate();

      await this.powerSync.execute(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type,
          description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, productId, quantity, type, description, now]
      );

      await this.powerSync.execute(
        `UPDATE products 
        SET stock_quantity = stock_quantity + ?,
            updated_at = ?
        WHERE id = ?`,
        [quantity, now, productId]
      );
    } catch (error) {
      console.error('Failed to record stock movement:', error);
      throw error;
    }
  }

  async getProductMovements(productId: string): Promise<StockMovementRecord[]> {
    try {
      return await this.powerSync.getAll(
        'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC',
        [productId]
      );
    } catch (error) {
      console.error('Failed to fetch product movements:', error);
      throw error;
    }
  }
} 