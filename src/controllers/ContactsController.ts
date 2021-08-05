import { Request, Response } from 'express';
import Whatsapp from '../whatsapp/client';

export default class ContactsController {
  private whatsapp: Whatsapp;

  public async index(request: Request, response: Response): Promise<Response> {
    const { phoneNumber } = request.params;
    const onlyGroup = request.query.onlyGroup === 'true';

    if (!this.whatsapp) {
      this.whatsapp = new Whatsapp();
    }

    const contacts = (await this.whatsapp.getContacts(phoneNumber))
      .filter(contact => (onlyGroup ? contact.isGroup : true))
      .map(contact => ({ id: contact.id.user, name: contact.name }));

    return response.json({ contacts });
  }
}
