import { Request, Response } from 'express';
import Whatsapp from '../whatsapp/client';

export default class ContactsController {
  private whatsapp: Whatsapp;

  constructor() {
    // Initialize the WhatsApp instance in the constructor to avoid creating it multiple times
    this.whatsapp = new Whatsapp();
  }

  public async index(request: Request, response: Response): Promise<Response> {
    try {
      const { phoneNumber } = request.params;
      const onlyGroup = request.query.onlyGroup === 'true';

      // Get contacts once and filter/map them
      const contacts = (await this.whatsapp.getContacts(phoneNumber))
        .filter(contact => !onlyGroup || contact.isGroup)
        .map(contact => ({ id: contact.id.user, name: contact.name }));

      return response.json({ contacts });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return response.status(500).json({ error: 'Failed to fetch contacts' });
    }
  }
}

