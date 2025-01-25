import { AbstractPowerSyncDatabase } from "@powersync/web";
import { BaseService } from "./base.service";

type Campaign = {
  id: string;
  type: 'email' | 'sms';
  title: string;
  content: string;
  recipients: string[];
  status: 'draft' | 'sent';
  created_at: string;
};

export class CampaignsService extends BaseService<Campaign> {
  constructor(powerSync: AbstractPowerSyncDatabase) {
    super(powerSync, 'campaigns');
  }

  async sendEmailCampaign(campaign: { title: string; content: string; recipients: string[] }) {
    try {
      if (campaign.recipients.length === 0) {
        throw new Error('Aucun destinataire spécifié');
      }

      const response = await fetch('/api/send-email-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: campaign.recipients,
          subject: campaign.title,
          content: campaign.content
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to send email campaign:', error);
      throw error;
    }
  }

  async sendSMSCampaign(campaign: { content: string; recipients: string[] }) {
    try {
      // Intégration générique pour SMS
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
      return response.json();
    } catch (error) {
      console.error('Failed to send SMS campaign:', error);
      throw error;
    }
  }
}
