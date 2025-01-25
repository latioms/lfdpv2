'use client'

import { useState } from "react"
import { CustomerSearch } from "../customers/customer-search"
import { CustomerRecord } from "@/services/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"

export function EmailCampaignForm() {
  const [loading, setLoading] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState<CustomerRecord[]>([])
  const [manualEmails, setManualEmails] = useState<string>('')
  const [batchMode, setBatchMode] = useState(true)

  const handleAddCustomer = (customer: CustomerRecord) => {
    if (!selectedCustomers.find(c => c.id === customer.id)) {
      setSelectedCustomers([...selectedCustomers, customer])
    }
  }

  const handleRemoveCustomer = (customerId: string) => {
    setSelectedCustomers(selectedCustomers.filter(c => c.id !== customerId))
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const recipients = [
        ...selectedCustomers.map(c => c.email),
        ...manualEmails.split(',').map(email => email.trim()).filter(email => email !== '')
      ]
      
      const subject = formData.get('subject') as string
      const content = formData.get('content') as string

      if (batchMode) {
        // Mode batch - Envoi groupé
        try {
          await fetch('/api/send-email-batch', {
            method: 'POST',
            body: JSON.stringify({ recipients, subject, content }),
          })
          toast.success(`Campagne envoyée avec succès`, {
            description: `${recipients.length} emails envoyés`
          })
        } catch (error) {
          toast.error("Échec de l'envoi groupé", {
            description: "Une erreur s'est produite"
          })
        }
      } else {
        // Mode séquentiel - Un par un avec délai
        let successCount = 0
        
        for (const recipient of recipients) {
          try {
            await fetch('/api/send-email', {
              method: 'POST',
              body: JSON.stringify({ recipient, subject, content }),
            })
            successCount++
            toast.success(`Email envoyé à ${recipient}`, {
              description: `Progression: ${successCount}/${recipients.length}`
            })
            await sleep(2500) // Attente de 2.5 secondes entre chaque envoi
          } catch (error) {
            toast.error(`Échec d'envoi à ${recipient}`)
          }
        }
      }

      // Réinitialiser le formulaire
      setSelectedCustomers([])
      setManualEmails('')
      e.currentTarget.reset()
      
    } catch (error) {
      toast.error("Erreur lors de l'envoi", {
        description: "Veuillez réessayer plus tard"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="batch-mode"
          checked={batchMode}
          onCheckedChange={setBatchMode}
        />
        <Label htmlFor="batch-mode">
          {batchMode ? "Mode envoi groupé" : "Mode envoi séquentiel"}
        </Label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sujet</label>
        <Input name="subject" type="text" required placeholder="Sujet de l'email" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sélectionner des clients</label>
        <CustomerSearch onSelect={handleAddCustomer} />
        
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCustomers.map(customer => (
            <Badge 
              key={customer.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {customer.name}
              <button
                type="button"
                onClick={() => handleRemoveCustomer(customer.id)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Emails additionnels (séparés par des virgules)</label>
        <Textarea 
          value={manualEmails}
          onChange={(e) => setManualEmails(e.target.value)}
          placeholder="email@exemple.com, email2@exemple.com"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Contenu</label>
        <Textarea name="content" required placeholder="Contenu de l'email" className="min-h-[200px]" />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          batchMode ? "Envoi groupé en cours..." : "Envoi séquentiel en cours..."
        ) : (
          "Envoyer la campagne"
        )}
      </Button>
    </form>
  )
}
