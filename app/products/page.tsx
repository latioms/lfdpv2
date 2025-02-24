// app/products/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useServices } from '@/hooks/useService';
import { ProductRecord, CategoryRecord } from '@/services/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pencil,
  Trash2,
  AlertCircle,
  Plus,
  Package,
  RefreshCw
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  alert_threshold: string;
  category_id: string;
}

interface RestockFormData {
  productId: string;
  quantity: string;
  description: string;
}

const initialRestockFormData: RestockFormData = {
  productId: '',
  quantity: '',
  description: ''
};

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '',
  alert_threshold: '',
  category_id: '',
};

export default function ProductsPage() {
  const { products: productsService, categories: categoriesService, stock: stockService } = useServices();

  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [restockFormData, setRestockFormData] = useState<RestockFormData>(initialRestockFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLowStockProducts = () => {
    return products.filter(product => 
      product.stock_quantity <= product.alert_threshold
    );
  };

  const handleRestockInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRestockFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRestockProductSelect = (productId: string) => {
    setRestockFormData(prev => ({ ...prev, productId }));
    setIsRestockDialogOpen(true);
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restockFormData.productId || !restockFormData.quantity || Number(restockFormData.quantity) <= 0) {
      toast.error('Veuillez entrer une quantité valide');
      return;
    }

    try {
      await stockService.recordMovement(
        restockFormData.productId,
        Number(restockFormData.quantity),
        'purchase',
        restockFormData.description || 'Restock'
      );

      await loadProducts();
      setRestockFormData(initialRestockFormData);
      setIsRestockDialogOpen(false);
      
      toast.success('Stock mis à jour avec succès');
    } catch { 
      toast.error('Échec de la mise à jour du stock');
    }
  };

  // Move loadProducts before loadData and wrap in useCallback
  const loadProducts = useCallback(async () => {
    try {
      let productsData;
      if (selectedCategory === 'all') {
        productsData = await productsService.getAll();
      } else {
        productsData = await productsService.getByCategory(selectedCategory);
      }
      setProducts(productsData);
    } catch { 
      toast.error('Échec du chargement des produits');
    }
  }, [selectedCategory, productsService]);

  // Keep loadData as useCallback but update dependencies
  const loadData = useCallback(async () => {
    try {
      const categoriesData = await categoriesService.getAll();
      setCategories(categoriesData);
      await loadProducts();
    } catch (err) {
      handleError(err, 'Failed to load data');
    }
  }, [categoriesService, loadProducts]);

  // Keep only one effect for initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Error handling
  const handleError = (err: unknown, message: string) => {
    console.error(err);
    toast.error(message);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (data: ProductFormData): string | null => {
    if (!data.name.trim()) return 'Le nom est requis';
    if (isNaN(Number(data.price)) || Number(data.price) < 0) 
      return 'Le prix doit être un nombre positif';
    if (isNaN(Number(data.stock_quantity)) || Number(data.stock_quantity) < 0)
      return 'La quantité en stock doit être un nombre positif';
    if (isNaN(Number(data.alert_threshold)) || Number(data.alert_threshold) < 0)
      return 'Le seuil d\'alerte doit être un nombre positif';
    if (!data.category_id) return 'La catégorie est requise';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const validationError = validateForm(formData);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        alert_threshold: Number(formData.alert_threshold),
        category_id: formData.category_id,
      };

      if (isEditing) {
        // Mise à jour optimiste
        setProducts(currentProducts => 
          currentProducts.map(p => 
            p.id === isEditing ? { ...p, ...productData } : p
          )
        );
        
        await productsService.update(isEditing, productData);
        toast.success('Produit modifié avec succès');
      } else {
        // Création optimiste
        const newProduct = await productsService.create(productData);
        setProducts(currentProducts => [...currentProducts, newProduct]);
        toast.success('Produit créé avec succès');
      }

      setFormData(initialFormData);
      setIsDialogOpen(false);
      setIsEditing(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Échec de l'opération: ${message}`);
      // Rechargement en cas d'erreur pour synchroniser l'état
      await loadProducts();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: ProductRecord) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      alert_threshold: product.alert_threshold.toString(),
      category_id: product.category_id,
    });
    setIsEditing(product.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        const result = await productsService.safeDelete(id);
        
        if (result.success) {
          await loadProducts();
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Échec de la suppression du produit';
        toast.error(message);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Produits</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!isSubmitting) {
            setIsDialogOpen(open);
            if (!open) {
              setFormData(initialFormData);
              setIsEditing(null);
            }
          }
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData(initialFormData);
                setIsEditing(null);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ajouter un produit</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onValueChange={(value) => handleSelectChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Prix</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock_quantity">Quantité en stock</Label>
                    <Input
                      id="stock_quantity"
                      name="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="alert_threshold">Seuil d&apos;alerte</Label>
                  <Input
                    id="alert_threshold"
                    name="alert_threshold"
                    type="number"
                    value={formData.alert_threshold}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="animate-spin h-4 w-4" />
                    {isEditing ? 'Modification...' : 'Création...'}
                  </div>
                ) : (
                  <>{isEditing ? 'Modifier' : 'Créer'} le produit</>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Label htmlFor="category-filter">Filtrer par catégorie:</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {getLowStockProducts().length > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-500" size={20} />
            <Select
              onValueChange={handleRestockProductSelect}
              value=""
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="⚠️ Réapprovisionner" />
              </SelectTrigger>
              <SelectContent>
                {getLowStockProducts().map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.stock_quantity}/{product.alert_threshold})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Seuil</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-gray-100">
                  {categories.find(c => c.id === product.category_id)?.name}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                <Badge variant="secondary">
                  ${product.price.toFixed(2)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={product.stock_quantity <= product.alert_threshold ? "destructive" : "default"}
                  className="gap-1 items-center"
                >
                  <Package className="w-3 h-3" />
                  {product.stock_quantity}
                </Badge>
              </TableCell>
              <TableCell>{product.alert_threshold}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(product.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Réapprovisionner le stock
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRestockSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Produit</Label>
                <div className="p-2 bg-gray-100 rounded">
                  {products.find(p => p.id === restockFormData.productId)?.name}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantité à ajouter</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={restockFormData.quantity}
                  onChange={handleRestockInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input
                  id="description"
                  name="description"
                  value={restockFormData.description}
                  onChange={handleRestockInputChange}
                  placeholder="Raison du réapprovisionnement"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Confirmer le réapprovisionnement
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}