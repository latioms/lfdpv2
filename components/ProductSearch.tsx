import { useEffect, useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useOrderStore } from '@/store/order.store'
import { useServices } from '@/hooks/useService'
import { ProductRecord } from '@/services/types'

export function ProductSearch() {
  const { products } = useServices()
  const { isSearchOpen, toggleSearch, searchQuery, setSearchQuery, addItem } = useOrderStore()
  const [productsList, setProductsList] = useState<ProductRecord[]>([])
  
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length > 0) {
        const results = await products.search(searchQuery)
        setProductsList(results.slice(0, 2)) // Limiter à 2 résultats
      } else {
        setProductsList([])
      }
    }
    searchProducts()
  }, [searchQuery])

  const handleAddProduct = (product: ProductRecord) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    })
    setSearchQuery('')
    toggleSearch()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        toggleSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSearch])

  return (
    <Dialog open={isSearchOpen} onOpenChange={toggleSearch}>
      <div className="p-4">
        <Input
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {productsList.length > 0 && (
          <div className="p-2">
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
    </Dialog>
  )
} 