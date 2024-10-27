import { Request, Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';

import authConfig from '../config/auth';
import AppError from '../errors/AppError';

interface ITokenPayload extends JwtPayload {
  sub: string;
}

export default function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT not found', 401);
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = verify(token, authConfig.jwt.secret) as ITokenPayload;

    request.user = {
      id: decoded.sub,
    };

    return next();
  } catch (error) {
    throw new AppError('Invalid Token', 401);
  }
}
