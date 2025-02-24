import { useEffect, useState } from 'react'
import { useServices } from '@/hooks/useService'
import { formatDistance } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Skeleton } from "@/components/ui/skeleton"  // Ajout de l'import manquant

interface RecentOrder {
  id: string
  customerName: string
  total: number
  createdAt: string
}

export function RecentOrders() {
  const { orders } = useServices()
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        setIsLoading(true)
        const latest = await orders.getRecent(5)
        console.log('Received orders:', latest) // Pour le débogage
        if (Array.isArray(latest)) {
          setRecentOrders(latest)
        } else {
          setRecentOrders([])
          setError('Format de données invalide')
        }
      } catch (err) {
        console.error('Error loading orders:', err)
        setError('Impossible de charger les commandes récentes')
      } finally {
        setIsLoading(false)
      }
    }
    loadRecentOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 w-full max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-4">Commandes récentes</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 max-w-md">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 max-w-md">
      <h2 className="text-lg font-semibold mb-4">Commandes récentes</h2>
      {recentOrders.length === 0 ? (
        <p className="text-center text-gray-500">Aucune commande récente</p>
      ) : (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm text-gray-500">
                  {formatDistance(new Date(order.createdAt), new Date(), {
                    addSuffix: true,
                    locale: fr
                  })}
                </p>
              </div>
              <span className="font-semibold">{order.total} XAF</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
