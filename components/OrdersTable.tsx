/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useServices } from "@/hooks/useService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {Package, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type SortConfig = {
  key: 'created_at' | 'total_amount' | 'status' | 'customer_name';
  direction: 'asc' | 'desc';
};

type Order = {
  id: string;
  customer_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  customer_name: string;
};

import { formatDate } from "@/lib/utils";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { class: "bg-yellow-100 text-yellow-800", label: "En attente" },
    completed: { class: "bg-green-100 text-green-800", label: "Complétée" },
    cancelled: { class: "bg-red-100 text-red-800", label: "Annulée" },
  }[status.toLowerCase()] || { class: "bg-gray-100 text-gray-800", label: status };

  return <Badge className={statusConfig.class}>{statusConfig.label}</Badge>;
};

const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

export function OrdersTable() {
  const { customers, orders: ordersService } = useServices();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'created_at', 
    direction: 'desc' 
  });
  const itemsPerPage = 10;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const allOrders = await ordersService.getAll();
        const allCustomers = await customers.getAll();
    
        const ordersWithCustomerNames = allOrders.map(order => ({
          ...order,
          customer_name: allCustomers.find(c => c.id === order.customer_id)?.name || 'Client inconnu'
        }));
    
        setOrders(ordersWithCustomerNames);
      } catch {
        toast.error("Erreur lors du chargement des commandes", {
          description: "Impossible de récupérer les commandes"
        });
      }
    };
    loadOrders();
  }, []);

  const handleRowClick = async (orderId: string) => {
    try {
      const details = await ordersService.getWithItems(orderId);
      setSelectedOrder(details);
      setIsDialogOpen(true);
    } catch {
      toast.error("Erreur", {
        description: "Impossible de charger les détails de la commande"
      });
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      
      // Mise à jour locale de l'état
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Mise à jour de l'ordre sélectionné si le modal est ouvert
      if (selectedOrder && selectedOrder.order.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          order: { ...selectedOrder.order, status: newStatus }
        });
      }

      toast.success("Statut mis à jour avec succès");
    } catch (error: unknown) {
      toast.error("Erreur lors de la mise à jour du statut :" + error);
    }
  };

  const sortOrders = (ordersToSort: any[]) => {
    return [...ordersToSort].sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortConfig.key === 'total_amount') {
        return sortConfig.direction === 'asc' 
          ? a.total_amount - b.total_amount
          : b.total_amount - a.total_amount;
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = sortOrders(orders).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortableHeader = ({ column, label }: { column: SortConfig['key'], label: string }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="hover:bg-transparent flex items-center gap-1"
      >
        {label}
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </TableHead>
  );

  return (
    <>
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <SortableHeader column="customer_name" label="Client" />
              <SortableHeader column="total_amount" label="Montant" />
              <SortableHeader column="created_at" label="Date" />
              <SortableHeader column="status" label="Statut" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow 
                key={order.id}
                className="cursor-pointer transition-all hover:bg-gray-50"
                onClick={() => handleRowClick(order.id)}
              >
                <TableCell className="font-medium">{order.customer_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {formatPrice(order.total_amount)} XAF
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex w-[100px] items-center justify-start text-sm text-gray-500">
          Page {currentPage} sur {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(current => Math.max(1, current - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(current => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex w-[100px] items-center justify-end text-sm text-gray-500">
          {(currentPage - 1) * itemsPerPage + 1}-
          {Math.min(currentPage * itemsPerPage, orders.length)} sur {orders.length}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5" /> Détails de la commande
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.order.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-medium text-green-600">
                    {formatPrice(selectedOrder.order.total_amount)} XAF
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Statut</p>
                  <Select
                    value={selectedOrder.order.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.order.id, value as 'pending' | 'completed' | 'cancelled')}
                    disabled={selectedOrder.order.status === 'completed'}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>{getStatusBadge(selectedOrder.order.status)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        {getStatusBadge('pending')}
                      </SelectItem>
                      <SelectItem value="completed">
                        {getStatusBadge('completed')}
                      </SelectItem>
                      <SelectItem value="cancelled">
                        {getStatusBadge('cancelled')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" /> Articles
                </h3>
                <div className="divide-y rounded-lg border bg-white">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {formatPrice(item.quantity * item.unit_price)} XAF
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full"
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
