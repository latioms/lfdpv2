"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/hooks/useService";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerRecord } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2, UserPlus, Mail, Phone, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function CustomersList() {
  const isMobile = useIsMobile();
  const { customers: customersService } = useServices();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const loadCustomers = useCallback(async () => {
    try {
      const data = searchQuery
        ? await customersService.search(searchQuery)
        : await customersService.getAll();
      setCustomers(data);
    } catch (err: unknown) {
      toast.error("Failed to load customers", {description: `Une erreur s'est produite : ${err}`} );
    } finally {
      setLoading(false);
    }
  }, [customersService, searchQuery]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customersService.create(newCustomer);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
      await loadCustomers();
      // close dialog

      toast.success("Customer added successfully");
    } catch (err) {
      toast.error("Failed to add customer",{description: `Une erreur s'est produite : ${err}`});
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      await customersService.update(editingCustomer.id, editingCustomer);
      await loadCustomers();
      setEditingCustomer(null);
      toast.success("Customer updated successfully");
    } catch (err) {
      toast.error("Failed to update customer", {description: `Une erreur s'est produite : ${err}`});
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await customersService.delete(id);
      await loadCustomers();
      toast.success("Customer deleted successfully");
    } catch (err) {
      toast.error("Failed to delete customer", {description: `Une erreur s'est produite : ${err}`});
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-between">
        <Input
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              {isMobile ? <UserPlus size={20} /> : "Ajouter un client"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <Input
                placeholder="Nom"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
              <Input
                placeholder="Phone"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
              <Input
                placeholder="Address"
                value={newCustomer.address}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
              <Button type="submit">Add Customer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-slate-50">
              <TableCell className="font-semibold text-slate-500">{customer.name}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-sm">{customer.address}</span>
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingCustomer(customer)}
                      className="hover:bg-blue-50"
                    >
                      {isMobile ? <Pencil size={16} /> : "Modifier"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le client</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCustomer} className="space-y-4">
                      <Input
                        placeholder="Name"
                        value={editingCustomer?.name}
                        onChange={(e) =>
                          setEditingCustomer(
                            prev => prev ? { ...prev, name: e.target.value } : null
                          )
                        }
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={editingCustomer?.email}
                        onChange={(e) =>
                          setEditingCustomer(
                            prev => prev ? { ...prev, email: e.target.value } : null
                          )
                        }
                      />
                      <Input
                        placeholder="Phone"
                        value={editingCustomer?.phone}
                        onChange={(e) =>
                          setEditingCustomer(
                            prev => prev ? { ...prev, phone: e.target.value } : null
                          )
                        }
                      />
                      <Input
                        placeholder="Address"
                        value={editingCustomer?.address}
                        onChange={(e) =>
                          setEditingCustomer(
                            prev => prev ? { ...prev, address: e.target.value } : null
                          )
                        }
                      />
                      <Button type="submit">Update Customer</Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="hover:bg-red-700"
                    >
                      {isMobile ? <Trash2 size={16} /> : "Supprimer"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le client</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer ce client? Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
