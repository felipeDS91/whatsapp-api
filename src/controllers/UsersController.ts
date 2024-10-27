import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import User from '../models/User';
import CreateUserService from '../services/CreateUserService';

export default class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { username, password, admin } = request.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400);
    }

    try {
      const createUser = new CreateUserService();

      const user = await createUser.execute({
        username,
        password,
        admin,
      });

      const userWithoutPassword = {
        id: user.id,
        name: user.username,
        admin: user.admin,
      };

      return response.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error creating user', 500);
    }
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    try {
      const userRepository = getRepository(User);

      const user = await userRepository.findOne(id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      await userRepository.remove(user);

      return response.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error deleting user', 500);
    }
  }
}
