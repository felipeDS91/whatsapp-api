import { Request, Response } from 'express';
import fs from 'fs';
import AppError from '../errors/AppError';

export default class TokensController {
  public async index(_: Request, response: Response): Promise<Response> {
    try {
      const image = fs.readFileSync('./screenshot.png', 'base64');
      const imageBuffer = Buffer.from(image, 'base64');

      response.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.length,
      });
      response.end(imageBuffer);

      return response.status(200).send();

    } catch (error) {
      throw new AppError('Secreenshot not found', 404);
    }
  }
}
