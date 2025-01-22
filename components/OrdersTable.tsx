"use client";
import { useState, useEffect } from "react";
import { useServices } from "@/hooks/useService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type OrderDetails = {
  order: {
    id: string;
    customer_id: string;
    total_amount: number;
    status: string;
    created_at: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
};
import { formatDate } from "@/lib/utils";

export function OrdersTable() {
  const { customers, orders: ordersService } = useServices(); // Renommé en ordersService
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      const allOrders = await ordersService.getAll();
      const allCustomers = await customers.getAll();
  
      // Enrichir les commandes avec les noms des clients
      const ordersWithCustomerNames = allOrders.map(order => ({
        ...order,
        customer_name: allCustomers.find(c => c.id === order.customer_id)?.name || 'Client inconnu'
      }));
  
      setOrders(ordersWithCustomerNames);
      console.log(allOrders)
    };
    loadOrders();
  }, []);

  const handleRowClick = async (orderId: string) => {
    const details = await ordersService.getWithItems(orderId); // Utilisez ordersService ici aussi
    setSelectedOrder(details);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Table className=" shadow-xl ">
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Produits</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleRowClick(order.id)}
            >
              <TableCell>{order.customer_name}</TableCell>
              <TableCell>{order.total_amount} XAF</TableCell>
              <TableCell>{order.items?.length() || 0}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{formatDate(selectedOrder.order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p>{selectedOrder.order.total_amount} XAF</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Produits</h3>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span>{item.product_name}</span>
                    <span>{item.quantity} × {item.unit_price} XAF</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
