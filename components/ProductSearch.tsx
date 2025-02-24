import { useEffect, useState, useCallback } from "react";
import { useOrderStore } from "@/store/order.store";
import { Input } from "@/components/ui/input";
import { useServices } from "@/hooks/useService";
import { ProductRecord } from "@/services/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function ProductSearch() {
  const { products } = useServices();
  const { isSearchOpen, toggleSearch, searchQuery, setSearchQuery, addItem } =
    useOrderStore();
  const [productsList, setProductsList] = useState<ProductRecord[]>([]);

  const searchProducts = useCallback(async () => {
    if (searchQuery.length > 0) {
      const results = await products.search(searchQuery);
      setProductsList(results.slice(0, 3));
    } else {
      setProductsList([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts();
    }, 300); // Ajoute un délai de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchProducts]);

  const handleAddProduct = (product: ProductRecord) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
    setSearchQuery("");
    toggleSearch();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
      // Ajouter la gestion de la touche Escape
      if (e.key === "Escape") {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch]);

  if (!isSearchOpen) return null;

  return (
    <>
      <div className="inset-0 z-40" onClick={toggleSearch} />
      <div className="fixed left-1/2 top-4 -translate-x-1/2 w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-4 mx-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 top-6"
            onClick={toggleSearch}
          >
            <X className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="rounded-md"
          />
          {productsList.length > 0 && (
            <div className="mt-2">
              {productsList.map((product) => (
                <div
                  key={product.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  onClick={() => handleAddProduct(product)}
                >
                  <div className="flex justify-between items-center">
                    <span>{product.name}</span>
                    <span>{product.price} XAF</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
