import { Router } from 'express';

import AuthenticationUserService from '../services/AuthenticateUserService';

const sessionsRouter = Router();

sessionsRouter.post('/', async (request, response) => {
  try {
    const { name, key } = request.body;

    const authenticateUser = new AuthenticationUserService();

    const { user, token, expires } = await authenticateUser.execute({
      name,
      key,
    });

    const userWithoutKey = {
      id: user.id,
      name: user.name,
    };

    return response.json({ user: userWithoutKey, token, expires });
  } catch ({ message }) {
    return response.status(400).json({ message });
  }
});

export default sessionsRouter;
