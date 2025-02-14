import { OrderRecord, ProductRecord, CategoryRecord, CustomerRecord } from '@/services/types';

export type {
  MonthlyRevenue,
  CategorySales,
  TopProduct,
  TopCustomer
};

type MonthlyRevenue = {
  month: string;
  revenue: number;
};

type CategorySales = {
  category: string;
  sales: number;
  revenue: number;
};

type TopProduct = {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
};

export interface StockLevel {
  id: string;
  name: string;
  currentStock: number;
  maxStock: number;
  percentage: number;
}

type TopCustomer = {
  id: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
};


// Chiffre d'affaires des 6 derniers mois
export function getLastSixMonthsRevenue(orders: OrderRecord[]): MonthlyRevenue[] {
    const monthlyRevenue = new Map<string, number>();
    const months = getLastSixMonths();
  
    months.forEach(month => {
      monthlyRevenue.set(month, 0);
    });
  
    orders.forEach(order => {
      const orderMonth = new Date(order.created_at).toLocaleDateString('fr-FR', { month: 'long' });
      if (monthlyRevenue.has(orderMonth)) {
        monthlyRevenue.set(
          orderMonth,
          monthlyRevenue.get(orderMonth)! + order.total_amount
        );
      }
    });
  
    return Array.from(monthlyRevenue.entries()).map(([month, revenue]) => ({
      month,
      revenue
    }));
  }

// Ventes par catégorie (mensuel ou hebdomadaire)
export const getCategorySales = (
  orders: OrderRecord[],
  orderItems: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>,
  products: ProductRecord[],
  categories: CategoryRecord[],
  period: 'month' | 'week' = 'month' // Rendre period optionnel avec une valeur par défaut
): CategorySales[] => {
  const salesByCategory = categories.map(category => ({
    category: category.name,
    sales: 0,
    revenue: 0
  }));

  const completedOrders = orders.filter(order => 
    order.status === 'completed' &&
    new Date(order.created_at) >= (
      period === 'month' 
        ? new Date(new Date().setMonth(new Date().getMonth() - 1))
        : new Date(new Date().setDate(new Date().getDate() - 7))
    )
  );

  // Créer un map des produits pour un accès plus rapide
  const productsMap = products.reduce((acc, product) => {
    acc[product.id] = product;
    return acc;
  }, {} as { [key: string]: ProductRecord });

  // Traitement des commandes et items
  completedOrders.forEach(order => {
    const items = orderItems.filter(item => {
        // @ts-expect-error order_id property missing in type
        return item.order_id === order.id;
    });
    items.forEach(item => {
      const product = productsMap[item.product_id];
      if (product) {
        const categoryIndex = categories.findIndex(c => c.id === product.category_id);
        if (categoryIndex !== -1) {
          salesByCategory[categoryIndex].sales += item.quantity;
          salesByCategory[categoryIndex].revenue += item.quantity * item.unit_price;
        }
      }
    });
  });

  return salesByCategory.filter(cat => cat.sales > 0).sort((a, b) => b.revenue - a.revenue);
};

// Top 6 produits les plus vendus
export const getTopSellingProducts = (
  orders: OrderRecord[],
  orderItems: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>,
  products: ProductRecord[]
): TopProduct[] => {
  const productSales = new Map<string, { count: number; revenue: number }>();

  orderItems.forEach(item => {
    const current = productSales.get(item.product_id) || { count: 0, revenue: 0 };
    productSales.set(item.product_id, {
      count: current.count + item.quantity,
      revenue: current.revenue + (item.quantity * item.unit_price)
    });
  });

  return Array.from(productSales.entries())
    .map(([productId, sales]) => ({
      id: productId,
      name: products.find(p => p.id === productId)?.name ?? 'Inconnu',
      salesCount: sales.count,
      revenue: sales.revenue
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 6);
};

// Mise à jour de la fonction getStockLevels pour correspondre à l'interface
export const getStockLevels = (products: ProductRecord[]): StockLevel[] => {
  return products.map(product => ({
    id: product.id,
    name: product.name,
    currentStock: product.stock_quantity,
    maxStock: product.stock_quantity + (product.alert_threshold * 2),
    percentage: (product.stock_quantity / (product.stock_quantity + (product.alert_threshold * 2))) * 100
  }));
};

// Classement des meilleurs clients
export const getTopCustomers = (
  orders: OrderRecord[],
  customers: CustomerRecord[]
): TopCustomer[] => {
  const customerStats: { [key: string]: TopCustomer } = {};

  orders.forEach(order => {
    if (order.status === 'completed') {
      const customer = customers.find(c => c.id === order.customer_id);
      if (!customer) return;

      if (!customerStats[customer.id]) {
        customerStats[customer.id] = {
          id: customer.id,
          name: customer.name,
          orderCount: 0,
          totalSpent: 0,
          lastOrderDate: order.created_at
        };
      }

      customerStats[customer.id].orderCount++;
      customerStats[customer.id].totalSpent += order.total_amount;
      
      if (new Date(order.created_at) > new Date(customerStats[customer.id].lastOrderDate)) {
        customerStats[customer.id].lastOrderDate = order.created_at;
      }
    }
  });

  return Object.values(customerStats)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);
};

// Produits en stock critique (Fonction supplémentaire 1)
export const getCriticalStock = (products: ProductRecord[]): ProductRecord[] => {
  return products
    .filter(product => product.stock_quantity <= product.alert_threshold)
    .sort((a, b) => 
      (a.stock_quantity / a.alert_threshold) - (b.stock_quantity / b.alert_threshold)
    );
};


// Modifié pour utiliser les données jointes
export const getProductSalesDistribution = (
  orders: OrderRecord[],
  orderItems: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>,
  products: ProductRecord[]
): Array<{ name: string; value: number; percentage: number }> => {
  const salesByProduct = new Map<string, { name: string; value: number; percentage: number }>();

  // Initialiser pour tous les produits
  products.forEach(product => {
    salesByProduct.set(product.id, {
      name: product.name,
      value: 0,
      percentage: 0
    });
  });

  // Calculer les ventes à partir des items de commande
  orderItems.forEach(item => {
    const productStats = salesByProduct.get(item.product_id);
    if (productStats) {
      productStats.value += item.quantity;
    }
  });

  const totalSales = Array.from(salesByProduct.values())
    .reduce((sum, product) => sum + product.value, 0);

  // Calculer les pourcentages
  return Array.from(salesByProduct.entries())
    .map(([, stats]) => ({
      ...stats,
      percentage: totalSales > 0 ? (stats.value / totalSales) * 100 : 0
    }))
    .filter(stats => stats.value > 0)
    .sort((a, b) => b.value - a.value);
};


function getLastSixMonths(): string[] {
    const months = [];
    const date = new Date();
    
    for (let i = 0; i < 6; i++) {
        months.unshift(
            date.toLocaleDateString('fr-FR', { month: 'long' })
        );
        date.setMonth(date.getMonth() - 1);
    }
    
    return months;
}

