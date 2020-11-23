import { Request, Response } from 'express';
import Whatsapp from '../whatsapp/client';

export default class PromptTokenController {
  private whatsapp: Whatsapp;

  public async create(request: Request, response: Response): Promise<Response> {
    if (!this.whatsapp) {
      this.whatsapp = new Whatsapp();
    }

    const qrCode = await this.whatsapp.registerNewToken();

    const image = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(image, 'base64');
    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });
    response.end(imageBuffer);

    return response.status(200).send();
  }
}
