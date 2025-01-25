'use client'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function SmsCampaignForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Logique d'envoi
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <Textarea required placeholder="Votre message SMS" className="min-h-[150px]" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Numéros de téléphone (séparés par des virgules)</label>
        <Textarea required placeholder="+237600000000, +237600000001" />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Envoi en cours..." : "Envoyer les SMS"}
      </Button>
    </form>
  )
}
