import { getRepository } from 'typeorm';
import { compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import authConfig from '../config/auth';

import User from '../models/User';
import AppError from '../errors/AppError';

interface ITokenPayload {
  iat: string;
  exp: number;
  sub: string;
}

interface IRequest {
  name: string;
  key: string;
}

interface IResponse {
  user: User;
  token: string;
  expires: number;
}

class AuthenticateUserService {
  public async execute({ name, key }: IRequest): Promise<IResponse> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne({ where: { name } });

    if (!user) {
      throw new AppError('Invalid e-mail or password');
    }

    const passwordMatched = await compare(key, user.key);

    if (!passwordMatched) {
      throw new AppError('Invalid e-mail or password');
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: user.id,
      expiresIn,
    });

    const decoded = verify(token, secret);
    const { exp } = decoded as ITokenPayload;

    return {
      user,
      token,
      expires: exp,
    };
  }
}

export default AuthenticateUserService;
