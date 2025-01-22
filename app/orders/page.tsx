import { OrdersTable } from '@/components/OrdersTable'

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Liste des commandes</h1>
      <OrdersTable />
    </div>
  )
}