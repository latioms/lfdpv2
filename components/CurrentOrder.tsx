import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
import { useServices } from '@/hooks/useService'
import { SupabaseConnector } from '@/lib/powersync/SupabaseConnector'

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

const connector = new SupabaseConnector()

export function CurrentOrder() {
  const { orders } = useServices()

  const { items, customer, toggleCustomerDialog, updateQuantity, removeItem, clearOrder } = useOrderStore()

  const total = items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0)

  const handleFinalize = async () => {
    if (!customer) {
      toggleCustomerDialog()
      return
    }

    const fc = connector.fetchCredentials()
    const userId = (await fc).session.user.id

    await orders.create(
      customer.id,
      items.map((item: OrderItem) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price
      })),
      // user id of the user connected
      userId
    )

    clearOrder()
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Ordre en cours</h2>
        
        <div className="space-y-4">
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

        <div className="mt-4 flex items-center justify-between">
          <div>
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
          </div>
          <Button onClick={handleFinalize}>
            {customer ? 'Terminer & Enregistrer' : 'Sélectionner un client'}
          </Button>
        </div>
      </div>
    </div>
  )
} 