import { Request, Response } from 'express';
import AuthenticationUserService from '../services/AuthenticateUserService';
import AppError from '../errors/AppError';

export default class SessionsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { username, password } = request.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400);
    }

    try {
      const authenticateUser = new AuthenticationUserService();

      const { user, token, expires } = await authenticateUser.execute({
        username,
        password,
      });

      const userWithoutKey = {
        id: user.id,
        name: user.username,
      };

      return response.status(200).json({ user: userWithoutKey, token, expires });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Authentication failed', 401);
    }
  }
}
