import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { OrderRecord, OrderItemRecord } from "./types";

export class OrdersService extends BaseService<OrderRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'orders');
  }

  async create(
    customerId: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>,
    createdBy: string
  ): Promise<string> {
    try {
      const orderId = crypto.randomUUID();
      const now = this.formatDate();
      const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

      await this.powerSync.execute(
        `INSERT INTO orders (
          id, customer_id, total_amount, status,
          created_by, created_at, sync_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, customerId, totalAmount, 'pending', createdBy, now, 'pending']
      );

      for (const item of items) {
        const itemId = crypto.randomUUID();
        await this.powerSync.execute(
          `INSERT INTO order_items (
            id, order_id, product_id, quantity,
            unit_price, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [itemId, orderId, item.productId, item.quantity, item.unitPrice, now]
        );

        // Update stock
        await this.powerSync.execute(
          `UPDATE products 
          SET stock_quantity = stock_quantity - ?, 
              updated_at = ?
          WHERE id = ?`,
          [item.quantity, now, item.productId]
        );

        // Record stock movement
        const movementId = crypto.randomUUID();
        await this.powerSync.execute(
          `INSERT INTO stock_movements (
            id, product_id, quantity, movement_type,
            description, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            movementId,
            item.productId,
            -item.quantity,
            'sale',
            `Order ${orderId}`,
            now
          ]
        );
      }

      return orderId;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async updateStatus(orderId: string, status: OrderRecord['status']): Promise<void> {
    try {
      await this.powerSync.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  async getWithItems(orderId: string): Promise<{
    order: OrderRecord;
    items: Array<OrderItemRecord & { product_name: string }>;
  }> {
    try {
      const [order] = await this.powerSync.getAll<OrderRecord>(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );

      const items = await this.powerSync.getAll<OrderItemRecord & { product_name: string }>(
        `SELECT oi.*, p.name as product_name
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?`,
        [orderId]
      );

      return { order, items };
    } catch (error) {
      console.error('Failed to fetch order with items:', error);
      throw error;
    }
  }

  async getCustomerOrders(customerId: string): Promise<OrderRecord[]> {
    try {
      return await this.powerSync.getAll(
        'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
        [customerId]
      );
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      throw error;
    }
  }
} 