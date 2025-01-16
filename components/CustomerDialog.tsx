import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useOrderStore } from '@/store/order.store'
import { CustomerRecord } from '@/services/types'
import { useServices } from '@/hooks/useService'

export function CustomerDialog() {
  const { customers } = useServices()
  const { 
    isCustomerDialogOpen,
    closeCustomerDialog,
    setCustomer
  } = useOrderStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [customersList, setCustomersList] = useState<CustomerRecord[]>([])
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  })

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length > 0) {
      const results = await customers.search(query)
      setCustomersList(results)
    } else {
      setCustomersList([])
    }
  }

  const handleSelectCustomer = (customer: CustomerRecord) => {
    setCustomer(customer)
    closeCustomerDialog()
  }

  const handleCreateCustomer = async () => {
    if (newCustomer.name && newCustomer.email) {
      await customers.create(newCustomer)
      closeCustomerDialog()
    }
  }

  if (!isCustomerDialogOpen) {
    return null
  }

  return (
    <Dialog open={isCustomerDialogOpen} onOpenChange={closeCustomerDialog}>
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {mode === 'search' ? (
            <>
              <Input
                type="search"
                placeholder="Rechercher un client..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full mb-4"
                autoFocus
              />
              {customersList.length > 0 && (
                <div className="space-y-2 mb-4">
                  {customersList.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div>{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-center">
                <span>ou </span>
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setMode('create')}
                >
                  créer un nouveau client
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Input
                placeholder="Nom"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                autoFocus
              />
              <Input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
              <Input
                placeholder="Adresse (Optionnel)"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              />
              <Input
                placeholder="Téléphone (Optionnel)"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setMode('search')}>
                  Retour
                </Button>
                <Button onClick={handleCreateCustomer}>
                  Ajouter et Enregistrer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
} 