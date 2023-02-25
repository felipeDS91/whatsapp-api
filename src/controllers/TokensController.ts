import { Request, Response } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Token from '../models/Token';
import TokensRepository from '../repositories/TokensRepository';
import Whatsapp from '../whatsapp/client';

export default class TokensController {
  private whatsapp: Whatsapp;

  public async create(request: Request, response: Response): Promise<Response> {
    const { from } = request.body;
    if (!this.whatsapp) {
      this.whatsapp = new Whatsapp();
    }

    const tokenRepository = getCustomRepository(TokensRepository);
    await tokenRepository.deleteByPhone(process.env.DEFAULT_DDI + from);

    const qrCode = await this.whatsapp.registerNewToken(from);

    const image = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(image, 'base64');

    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
    });
    response.end(imageBuffer);

    return response.status(200).send();
  }

  public async index(_: Request, response: Response): Promise<Response> {
    const tokenRepository = getRepository(Token);
    const tokens = await tokenRepository.find();

    return response.json(tokens);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const phone = `${process.env.DEFAULT_DDI}${request.params.phone}`;

    await this.whatsapp.deleteSessionPath(phone);

    const tokenRepository = getCustomRepository(TokensRepository);

    const token = await tokenRepository.findByPhone(phone);

    if (!token) {
      throw new AppError('Token not found', 404);
    }

    await tokenRepository.delete(token);

    return response.status(200).send();
  }
}
