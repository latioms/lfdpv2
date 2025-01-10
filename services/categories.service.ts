import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { CategoryRecord } from "./types";

export class CategoriesService extends BaseService<CategoryRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'categories');
  }

  async create(name: string): Promise<void> {
    try {
      const id = crypto.randomUUID();
      await this.powerSync.execute(
        'INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)',
        [id, name, this.formatDate()]
      );
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  async update(id: string, name: string): Promise<void> {
    try {
      await this.powerSync.execute(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id]
      );
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }
} 