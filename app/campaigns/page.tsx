'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { EmailCampaignForm } from "@/components/campaigns/email-form"
import { SmsCampaignForm } from "@/components/campaigns/sms-form"

export default function CampaignsPage() {
  return (
    <div className="lg:w-2/5 lg:self-center py-6">
      <h1 className="text-3xl font-bold mb-6">Campagnes</h1>
      
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Campagne Email</TabsTrigger>
          <TabsTrigger value="sms">Campagne SMS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Card className="p-6">
            <EmailCampaignForm />
          </Card>
        </TabsContent>
        
        <TabsContent value="sms">
          <Card className="p-6">
            <SmsCampaignForm />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}