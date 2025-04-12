"use client"

import { useState } from 'react'
import { useOrderStore } from '@/store/order.store'
import { Button } from '@/components/ui/button'
import { UserCircle, Eye, Download, Check } from 'lucide-react'
import { Drawer } from "@/components/ui/drawer"
import { toast } from 'sonner'
import { useServices } from '@/hooks/useService'
import { SupabaseConnector } from '@/lib/powersync/SupabaseConnector'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Invoice } from './ui/invoice'

type OrderItem = {
  id: string
  name: string
  quantity: number
  price: number
}

const connector = new SupabaseConnector()

export function CurrentOrder() {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "success">("cart")
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)

  const { orders } = useServices()

  const { items, customer, toggleCustomerDialog, updateQuantity, removeItem, clearOrder, openCustomerDialog, isOrderDrawerOpen, toggleOrderDrawer } = useOrderStore()

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
  }

  const handleFinalize = async () => {
    if (!customer) {
      toggleCustomerDialog()
      return
    }

    if (checkoutStep === "cart") {
      setCheckoutStep("payment")
      return
    }

    if (checkoutStep === "payment" && paymentMethod) {
      const fc = connector.fetchCredentials()
      const userId = (await fc).session.user.id

      await toast.promise(
        orders.create(
          customer.id,
          items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          userId,
          paymentMethod // Add payment method to order
        ),
        {
          loading: 'Enregistrement de la commande...',
          success: 'Commande enregistrée avec succès !',
          error: 'Erreur lors de l\'enregistrement de la commande.'
        }
      )

      setCheckoutStep("success")
    }
  }

  const resetOrder = () => {
    clearOrder()
    setCheckoutStep("cart")
    setPaymentMethod(null)
    toggleOrderDrawer()
  }

  if (items.length === 0) {
    return null
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.015 // TVA 19.25%
  const total = subtotal + tax

  return (
    <>
      <Drawer isOpen={isOrderDrawerOpen} onToggle={toggleOrderDrawer}>
        <div className="h-full flex flex-col p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {checkoutStep === "success" 
                ? "Commande Confirmée"
                : checkoutStep === "payment"
                  ? "Paiement"
                  : "Ordre en cours"
              }
            </h2>
            {checkoutStep === "cart" && customer && items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInvoicePreview(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Aperçu facture
              </Button>
            )}
          </div>

          {checkoutStep === "success" ? (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Commande Confirmée!</h2>
              <p className="text-center text-muted-foreground">
                La commande a été enregistrée avec succès.
              </p>
              <Button 
                variant="outline"
                onClick={() => setShowInvoicePreview(true)}
                className="w-full mt-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger la facture
              </Button>
              <Button onClick={resetOrder} className="w-full">
                Nouvelle commande
              </Button>
            </div>
          ) : checkoutStep === "payment" ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Mode de paiement</h3>
                <RadioGroup value={paymentMethod || ""} onValueChange={handlePaymentMethodChange}>
                  <div className="flex items-center space-x-2 border rounded-md p-3 mb-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3 mb-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Espèces</Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer">Virement bancaire</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCheckoutStep("cart")}
                  className="w-full mb-2"
                >
                  Retour
                </Button>
                <Button 
                  onClick={handleFinalize}
                  disabled={!paymentMethod}
                  className="w-full"
                >
                  Confirmer la commande
                </Button>
              </div>
            </div>
          ) : (
            <>              
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
            </>
          )}
        </div>
      </Drawer>

      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="text-lg font-semibold mb-2">
            Facture
          </DialogTitle>
          <Invoice 
            customer={customer!}
            items={items}
            subtotal={subtotal}
            tax={tax}
            total={total}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}