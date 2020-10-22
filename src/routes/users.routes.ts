import { Router } from 'express';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import User from '../models/User';

import CreateUserService from '../services/CreateUserService';

const usersRouter = Router();

usersRouter.post('/', async (request, response) => {
  const { name, key, admin } = request.body;

  const createUser = new CreateUserService();

  const user = await createUser.execute({
    name,
    key,
    admin,
  });

  const userWithoutKey = {
    id: user.id,
    name: user.name,
    admin: user.admin,
  };

  return response.json({ user: userWithoutKey });
});

usersRouter.delete('/', async (request, response) => {
  const { id } = request.params;

  const userRepository = getRepository(User);

  const user = await userRepository.findOne(id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return response.status(200).send();
});

export default usersRouter;
