import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { OrderRecord, OrderItemRecord } from "./types";

export class OrdersService extends BaseService<OrderRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'orders');
  }

  async create(
customerId: string, items: Array<{ productId: string; quantity: number; unitPrice: number; }>, createdBy: string, paymentMethod: string  ): Promise<string> {
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

  async getAllWithDetails(): Promise<OrderRecord[]> {
    try {
      return await this.powerSync.getAll(`
        SELECT 
          o.*,
          json_group_array(
            json_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'product_name', p.name
            )
          ) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
    } catch (error) {
      console.error('Failed to fetch orders with details:', error);
      throw error;
    }
  }

  async getOrdersWithItemsAndProducts(): Promise<{
    orders: OrderRecord[];
    items: Array<{
      order_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
    }>;
  }> {
    try {
      const [orders, items] = await Promise.all([
        this.powerSync.getAll<OrderRecord>('SELECT * FROM orders'),
        this.powerSync.getAll<{
          order_id: string;
          product_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
        }>(`
          SELECT 
            oi.order_id,
            oi.product_id,
            p.name as product_name,
            oi.quantity,
            oi.unit_price
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
        `)
      ]);

      return { orders, items };
    } catch (error) {
      console.error('Failed to fetch orders with items:', error);
      throw error;
    }
  }

  async getRecent(limit: number = 5) {
    const query = await this.powerSync.getAll(`
      SELECT 
        o.id,
        c.name as customerName,
        o.created_at as createdAt,
        o.total_amount as total
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [limit]);

    return query;
  }
}