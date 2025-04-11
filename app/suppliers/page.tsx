"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/hooks/useService";
import { SupplierRecord } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SuppliersPage() {
  const { suppliers: suppliersService } = useServices();
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSupplier, setNewSupplier] = useState({ name: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async () => {
    try {
      const data = await suppliersService.getAll();
      setSuppliers(data);
      setError(null);
    } catch (err: unknown) {
      setError("Erreur de chargement des fournisseurs");
      toast.error("Erreur", {
        description: err instanceof Error ? err.message : "Erreur de chargement",
      });
    } finally {
      setLoading(false);
    }
  }, [suppliersService]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name.trim() || !newSupplier.phone.trim()) return;

    try {
      await suppliersService.create(newSupplier);
      await loadSuppliers();
      setNewSupplier({ name: "", phone: "" });
      toast.success("Fournisseur ajouté avec succès");
    } catch (err: unknown) {
      toast.error("Erreur d'ajout", {
        description: err instanceof Error ? err.message : "Erreur d'ajout",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await suppliersService.delete(id);
      await loadSuppliers();
      toast.success("Fournisseur supprimé");
    } catch (err: unknown) {
      toast.error("Erreur de suppression", {
        description: err instanceof Error ? err.message : "Erreur de suppression",
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Fournisseurs
        </h1>
        <Badge variant="outline" className="hidden md:flex">
          {suppliers.length} au total
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Nom du fournisseur"
          value={newSupplier.name}
          onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
          className="max-w-xs rounded-xl border-primary/20"
        />
        <Input
          type="text"
          placeholder="Numéro de téléphone"
          value={newSupplier.phone}
          onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
          className="max-w-xs rounded-xl border-primary/20"
        />
        <Button 
          type="submit" 
          disabled={!newSupplier.name.trim() || !newSupplier.phone.trim()} 
          className="transition-all hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2 md:inline-block" />
          <span className="hidden md:inline">Ajouter</span>
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow 
                  key={supplier.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    {supplier.name}
                    <Badge 
                      variant="secondary" 
                      className="ml-2 hidden md:inline-flex"
                    >
                      ID: {supplier.id}
                    </Badge>
                  </TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {new Date(supplier.created_at).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="transition-all hover:scale-105"
                        >
                          <Trash2 className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Supprimer</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white dark:bg-gray-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-red-600">
                            Supprimer le fournisseur
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{supplier.name}</span>?
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="transition-all hover:scale-105">
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(supplier.id)}
                            className="bg-red-600 hover:bg-red-700 transition-all hover:scale-105"
                          >
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {suppliers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-gray-500 italic"
                  >
                    Aucun fournisseur trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
