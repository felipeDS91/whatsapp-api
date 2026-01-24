import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Token from '../models/Token';
import TokensRepository from '../repositories/TokensRepository';
import Whatsapp from '../whatsapp/client';

export default class TokensController {
  private whatsapp: Whatsapp;
  private defaultDDI: string;

  constructor() {
    // Initialize Whatsapp and DDI once in the constructor
    this.whatsapp = new Whatsapp();
    this.defaultDDI = process.env.DEFAULT_DDI || '';
  }

  public async create(request: Request, response: Response): Promise<void> {
    const { from } = request.body;

    const tokenRepository = getRepository(TokensRepository);
    const phoneWithDDI = `${this.defaultDDI}${from}`;

    // Delete old token by phone
    await tokenRepository.deleteByPhone(phoneWithDDI);

    // Register a new token and get the QR code
    const qrCode = await this.whatsapp.registerNewToken(from);
    const image = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(image, 'base64');

    // Send the image buffer as a PNG response
    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });
    response.end(imageBuffer);
  }

  public async index(_: Request, response: Response): Promise<Response> {
    const tokenRepository = getRepository(Token);
    const tokens = await tokenRepository.find();

    return response.json(tokens);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const phone = `${this.defaultDDI}${request.params.phone}`;

    // Delete the Whatsapp session
    await this.whatsapp.deleteSessionPath(phone);

    const tokenRepository = getRepository(TokensRepository);

    const token = await tokenRepository.findByPhone(phone);
    if (!token) {
      throw new AppError('Token not found', 404);
    }

    // Delete the token record
    await tokenRepository.delete(token);

    return response.status(200).send();
  }
}
