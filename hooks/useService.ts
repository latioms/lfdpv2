// src/hooks/useService.ts
import { usePowerSync } from '@/hooks/usePowerSync';
import { 
  CategoriesService,
  ProductsService,
  CustomersService,
  OrdersService,
  StockService,
  SuppliersService
} from '@/services';

export function useServices() {
  const powerSync = usePowerSync();
  
  if (!powerSync) {
    throw new Error('PowerSync not initialized');
  }

  return {
    categories: new CategoriesService(powerSync),
    products: new ProductsService(powerSync),
    customers: new CustomersService(powerSync),
    orders: new OrdersService(powerSync),
    stock: new StockService(powerSync),
    suppliers: new SuppliersService(powerSync),
  };
}