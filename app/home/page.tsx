'use client'

import { Button } from '@/components/ui/button'
import { ProductSearch } from '@/components/ProductSearch'
import { CustomerDialog } from '@/components/CustomerDialog'
import { CurrentOrder } from '@/components/CurrentOrder'
import { useOrderStore } from '@/store/order.store'

export default function HomePage() {
  const { toggleSearch } = useOrderStore()

  return (
    <div className="container mx-auto p-4">
      <div className="fixed top-4 right-4 z-10">
        <Button
          size="lg"
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={toggleSearch}
        >
          +
        </Button>
      </div>

      <ProductSearch />
      <CustomerDialog />
      <CurrentOrder />
    </div>
  )
}
