import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseRecord } from "./types";

export abstract class BaseService<T extends BaseRecord> {
  constructor(protected powerSync: AbstractPowerSyncDatabase, protected tableName: string) {}

  async getAll(): Promise<T[]> {
    try {
      return await this.powerSync.getAll(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
    } catch (error) {
      console.error(`Failed to fetch ${this.tableName}:`, error);
      throw error;
    }
  }

  async getById(id: any): Promise<T | null> {
    try {
      const results = await this.powerSync.getAll<T>(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return results[0] || null;
    } catch (error) {
      console.error(`Failed to fetch ${this.tableName} by id:`, error);
      throw error;
    }
  }

  async delete(id: any): Promise<void> {
    try {
      await this.powerSync.execute(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
    } catch (error) {
      console.error(`Failed to delete ${this.tableName}:`, error);
      throw error;
    }
  }

  protected formatDate(date: Date = new Date()): string {
    return date.toISOString();
  }
} 