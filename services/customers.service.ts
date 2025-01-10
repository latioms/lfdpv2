import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { CustomerRecord } from "./types";

export class CustomersService extends BaseService<CustomerRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'customers');
  }

  async create(customer: Omit<CustomerRecord, 'id' | 'created_at'>): Promise<void> {
    try {
      const id = crypto.randomUUID();
      await this.powerSync.execute(
        `INSERT INTO customers (id, name, email, phone, address, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [id, customer.name, customer.email, customer.phone, customer.address, this.formatDate()]
      );
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  async update(id: string, customer: Partial<Omit<CustomerRecord, 'id' | 'created_at'>>): Promise<void> {
    try {
      const updates = Object.entries(customer)
        .filter(([_, value]) => value !== undefined)
        .map(([key]) => `${key} = ?`)
        .join(', ');

      const values = Object.entries(customer)
        .filter(([_, value]) => value !== undefined)
        .map(([_, value]) => value);

      await this.powerSync.execute(
        `UPDATE customers SET ${updates} WHERE id = ?`,
        [...values, id]
      );
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }

  async search(query: string): Promise<CustomerRecord[]> {
    try {
      return await this.powerSync.getAll(
        `SELECT * FROM customers 
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
        ORDER BY name`,
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
    } catch (error) {
      console.error('Failed to search customers:', error);
      throw error;
    }
  }
} 