import { Router } from 'express';

import CreateUserService from '../services/CreateUserService';

const usersRouter = Router();

usersRouter.post('/', async (request, response) => {
  try {
    const { name, key } = request.body;

    const createUser = new CreateUserService();

    const user = await createUser.execute({
      name,
      key,
    });

    const userWithoutKey = {
      id: user.id,
      name: user.name,
    };

    return response.json({ user: userWithoutKey });
  } catch ({ message }) {
    return response.status(400).json({ message });
  }
});

export default usersRouter;
