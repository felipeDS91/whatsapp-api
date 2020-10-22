import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import User from '../models/User';

export default async function ensureAdminOnly(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne(request.user.id);

    if (!user?.admin) {
      throw new AppError('Action allowed for administrators only!', 405);
    }
    return next();
  } catch {
    throw new AppError('Action allowed for administrators only!', 405);
  }
}
