import { Request, Response } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Token from '../models/Token';
import TokensRepository from '../repositories/TokensRepository';
import CreateTokenService from '../services/CreateTokenService';

export default class TokensController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { phone, token } = request.body;

    const createToken = new CreateTokenService();

    const newToken = await createToken.execute({
      phone,
      token,
    });

    return response.json(newToken);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const tokenRepository = getRepository(Token);
    const tokens = await tokenRepository.find();

    return response.json(tokens);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { phone } = request.params;

    const tokenRepository = getCustomRepository(TokensRepository);

    const token = await tokenRepository.findByPhone(phone);

    if (!token) {
      throw new AppError('Token not found', 404);
    }

    await tokenRepository.delete(token);

    return response.status(200).send();
  }
}
