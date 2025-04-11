import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";
import { CreateSupplierDTO, SupplierRecord } from "./types";
import { over } from "lodash";

export class SuppliersService extends BaseService<SupplierRecord> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'suppliers');
  }

  async getAll(): Promise<SupplierRecord[]> {
    try {
      return await this.powerSync.getAll<SupplierRecord>(
        'SELECT * FROM suppliers ORDER BY created_at DESC'
      );
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      throw new Error('Erreur lors du chargement des fournisseurs');
    }
  }
  async getById(id: number | null): Promise<SupplierRecord | null> {
    try {
      const results = await this.powerSync.getAll<SupplierRecord>(
        'SELECT * FROM suppliers WHERE id = ? LIMIT 1',
        [id]
      );
      return results[0] || null;
    } catch (error) {
      throw new Error('Erreur lors de la récupération du fournisseur');
    }
  }

  async create({ name, phone }: CreateSupplierDTO): Promise<void> {
    try {
      await this.powerSync.execute(
        `INSERT INTO suppliers (id, name, phone, created_at) 
         VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM suppliers), ?, ?, datetime('now'))`,
        [name, phone]
      );
    } catch (error) {
      console.error('Failed to create supplier:', error);
      throw error;
    }
  }

  async update(id: number, data: CreateSupplierDTO): Promise<void> {
    try {
      await this.powerSync.execute(
        `UPDATE suppliers 
         SET name = ?, phone = ?, updated_at = datetime('now') 
         WHERE id = ?`,
        [data.name, data.phone, id]
      );
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du fournisseur');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.powerSync.execute('DELETE FROM suppliers WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      throw error;
    }
  }
}