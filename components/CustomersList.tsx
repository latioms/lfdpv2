"use client";

import { useState, useEffect, useCallback } from "react";
import { useServices } from "@/hooks/useService";
import { CustomerRecord } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
    } catch (err) {
      toast.error("Failed to load customers");
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
      toast.success("Customer added successfully");
    } catch (err) {
      toast.error("Failed to add customer");
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
      toast.error("Failed to update customer");
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await customersService.delete(id);
      await loadCustomers();
      toast.success("Customer deleted successfully");
    } catch (err) {
      toast.error("Failed to delete customer");
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
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add New Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
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
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>{customer.name}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.address}</TableCell>
              <TableCell className="space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Customer</DialogTitle>
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
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this customer? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        Delete
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
