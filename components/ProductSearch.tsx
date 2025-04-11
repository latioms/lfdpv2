import { useEffect, useState, useCallback } from "react";
import { useOrderStore } from "@/store/order.store";
import { Input } from "@/components/ui/input";
import { useServices } from "@/hooks/useService";
import { ProductRecord } from "@/services/types";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";

export function ProductSearch() {
  const { products } = useServices();
  const { searchQuery, setSearchQuery, addItem } =
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
    toast.success(
      `${product.name} a été ajouté à la commande !`
    );
    setSearchQuery("");
  };


  return (
    <>
      <div className="relative left-1/2 top-12 -translate-x-1/2 w-full max-w-xl">
        <div className="bg-white rounded-lg shadow-sm ">
          <div className="relative flex">
            <Label htmlFor="search" className="sr-only"></Label>
            <Input
              placeholder="Rechercher un produit..."

              value={searchQuery}
              id='search'
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="pl-8 border border-gray-300 focus:outline focus:outline-sky-500 focus:border-green-400/30 focus:ring-0 focus:ring-sky-500 focus-visible:ring-none"
            />
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </div>
          {productsList.length > 0 && (
            <div className="mt-2">
              {productsList.map((product) => (
                <div
                  key={product.id}
                  className={`p-2 ${product.stock_quantity > 0
                      ? "hover:bg-green-100 cursor-pointer"
                      : "bg-gray-50 cursor-not-allowed opacity-60"
                    } rounded`}
                  onClick={() => {
                    if (product.stock_quantity > 0) {
                      handleAddProduct(product);
                    } else {
                      toast.error(`${product.name} est en rupture en stock`);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="">
                      <span className="font-semibold font-mono text-green-700 text-lg">{product.name}</span>
                      <div className="text-sm font-light text-orange-900/40 ">
                        {product.stock_quantity > 0
                          ? `Stock: ${product.stock_quantity}`
                          : "Rupture de stock"}
                      </div>
                    </div>
                    <span className="font-semibold font-mono text-gray-900/95">{product.price} <span className="font-extralight text-sm text-gray-500">XAF</span></span>
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
