'use client';

import { useEffect, useState } from 'react';
import { StockMovementRecord } from '@/services/types';
import { useServices } from "@/hooks/useService";
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function JournalPage() {
  const [movements, setMovements] = useState<StockMovementRecord[]>([]);
  const { stock: stockService, products: productsService } = useServices();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const allProducts = await productsService.getAll();
        const allMovements: StockMovementRecord[] = [];
        
        for (const product of allProducts) {
          const productMovements = await stockService.getProductMovements(product.id);
          allMovements.push(...productMovements);
        }

        // Trier par date décroissante
        allMovements.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setMovements(allMovements);
      } catch (err) {
        setError("Erreur lors du chargement des mouvements de stock");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
  }, [stockService, productsService]);

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'bg-green-500';
      case 'sale': return 'bg-red-500';
      case 'adjustment': return 'bg-yellow-500';
      case 'return': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Achat';
      case 'sale': return 'Vente';
      case 'adjustment': return 'Ajustement';
      case 'return': return 'Retour';
      default: return type;
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Journal des Mouvements de Stock</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>
                {formatDate(movement.created_at)}
              </TableCell>
              <TableCell>
                <Badge className={getMovementTypeColor(movement.movement_type)}>
                  {getMovementTypeLabel(movement.movement_type)}
                </Badge>
              </TableCell>
              <TableCell className={movement.quantity < 0 ? 'text-red-500' : 'text-green-500'}>
                {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
              </TableCell>
              <TableCell>{movement.description || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
