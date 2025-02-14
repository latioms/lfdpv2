import { useEffect, useState, useCallback } from 'react'
import { useOrderStore } from '@/store/order.store'
import { Input } from '@/components/ui/input'
import { useServices } from '@/hooks/useService'
import { ProductRecord } from '@/services/types'

export function ProductSearch() {
  const { products } = useServices()
  const { isSearchOpen, toggleSearch, searchQuery, setSearchQuery, addItem } = useOrderStore()
  const [productsList, setProductsList] = useState<ProductRecord[]>([])

  const searchProducts = useCallback(async () => {
    if (searchQuery.length > 0) {
      const results = await products.search(searchQuery)
      setProductsList(results.slice(0, 3))
    } else {
      setProductsList([])
    }
  }, [searchQuery, products])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts()
    }, 300) // Ajoute un délai de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchProducts])

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

  if (!isSearchOpen) return null

  return (

    <div className="justify-self-center w-3/5 bg-white rounded-none shadow-xl p-4">
      <Input
        placeholder="Rechercher un produit..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus
        className='rounded-none'
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
  )
}