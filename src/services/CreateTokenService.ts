import { getCustomRepository } from 'typeorm';
import Token from '../models/Token';
import TokensRepository from '../repositories/TokensRepository';

interface Request {
  phone: string;
  token: string;
}

class CreateTokenService {
  public async execute({ phone, token }: Request): Promise<Token> {
    const tokenRepository = getCustomRepository(TokensRepository);

    const checkTokenExists = await tokenRepository.findByPhone(phone);

    const result = await tokenRepository.save({
      ...checkTokenExists,
      phone,
      token,
    });

    return result;
  }
}

export default CreateTokenService;
