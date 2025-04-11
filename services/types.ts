export interface BaseRecord {
  id: any;
  created_at: string;
}

export interface CategoryRecord extends BaseRecord {
  name: string;
}

export interface SupplierRecord {
  id: number;
  name: string;
  phone: string;
  created_at: string;
}

export type CreateSupplierDTO = Pick<SupplierRecord, 'name' | 'phone'>;
export type UpdateSupplierDTO = CreateSupplierDTO & { id: number };

export interface ProductRecord extends BaseRecord {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  alert_threshold: number;
  category_id: string;
  supplier: number;
  image_url?: string;
  updated_at: string;
  supplier_name?: string; // Pour joindre le nom du fournisseur lors des requêtes
}

export interface CustomerRecord extends BaseRecord {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface OrderRecord extends BaseRecord {
  id: string;
  customerId: string;
  userId: string;
  createdAt: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_by: string;
  sync_status: 'pending' | 'synced' | 'error';
}

export interface OrderItemRecord extends BaseRecord {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface StockMovementRecord extends BaseRecord {
  product_id: string;
  quantity: number;
  movement_type: 'purchase' | 'sale' | 'adjustment' | 'return';
  description?: string;
}