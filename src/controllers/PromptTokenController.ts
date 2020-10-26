import { Request, Response } from 'express';
import Whatsapp from '../whatsapp/client';

export default class PromptTokenController {
  public async create(request: Request, response: Response): Promise<Response> {
    const whatsapp = new Whatsapp();
    await whatsapp.registerNewToken();

    return response.status(200).send();
  }
}
