import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import User from '../models/User';
import CreateUserService from '../services/CreateUserService';

export default class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { username, password, admin } = request.body;

    const createUser = new CreateUserService();

    const user = await createUser.execute({
      username,
      password,
      admin,
    });

    const userWithoutKey = {
      id: user.id,
      name: user.username,
      admin: user.admin,
    };

    return response.json({ user: userWithoutKey });
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const userRepository = getRepository(User);

    const user = await userRepository.findOne(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return response.status(200).send();
  }
}
