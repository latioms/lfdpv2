import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/useService'
import { SupabaseConnector } from '@/lib/powersync/SupabaseConnector'
import { UserCircle } from 'lucide-react'
import { Drawer } from "@/components/ui/drawer"
import { toast } from 'sonner'

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

const connector = new SupabaseConnector()

export function CurrentOrder() {
  const { orders } = useServices()

  const { items, customer, toggleCustomerDialog, updateQuantity, removeItem, clearOrder, openCustomerDialog, isOrderDrawerOpen, toggleOrderDrawer } = useOrderStore()

  const total = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0)

  const handleFinalize = async () => {
    if (!customer) {
      toggleCustomerDialog()
      return
    }

    const fc = connector.fetchCredentials()
    const userId = (await fc).session.user.id

    toast.promise(
      orders.create(
        customer.id,
        items.map((item: OrderItem) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price
        })),
        userId
      ),
      {
        loading: 'Enregistrement de la commande...',
        success: 'Commande enregistrée avec succès !',
        error: 'Erreur lors de l\'enregistrement de la commande.'
      }
    )

    clearOrder()
  }

  if (items.length === 0) {
    return null
  }

  return (
    <Drawer isOpen={isOrderDrawerOpen} onToggle={toggleOrderDrawer}>
      <div className="h-full flex flex-col p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Ordre en cours</h2>
        
        {/* Section Client */}
        <div className="mb-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <UserCircle className="w-6 h-6" />
              {customer ? (
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              ) : (
                <p className="text-gray-500">Aucun client sélectionné</p>
              )}
            </div>
            <Button 
              variant="outline" 
              onClick={openCustomerDialog}
            >
              {customer ? 'Changer' : 'Ajouter'}
            </Button>
          </div>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-gray-500">
                  {item.quantity} × {item.price} XAF = {item.quantity * item.price} XAF
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer avec total et bouton de finalisation */}
        <div className="border-t pt-4 bg-white">
          <div className="flex flex-col gap-4">
            <div className="text-lg font-semibold">
              Total: {total} XAF
            </div>
            {customer ? (
              <div className="text-sm text-gray-500">
                Pour: {customer.name}
              </div>
            ) : (
              <Button variant="link" onClick={toggleCustomerDialog}>
                + Ajouter un client
              </Button>
            )}
            <Button 
              onClick={handleFinalize}
              className="w-full"
            >
              {customer ? 'Terminer & Enregistrer' : 'Sélectionner un client'}
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  )
}