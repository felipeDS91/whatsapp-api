import { Request, Response } from 'express';
import AuthenticationUserService from '../services/AuthenticateUserService';

export default class SessionsController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { username, password } = request.body;
    const authenticateUser = new AuthenticationUserService();

    const { user, token, expires } = await authenticateUser.execute({
      username,
      password,
    });

    const userWithoutKey = {
      id: user.id,
      name: user.username,
    };

    return response.json({ user: userWithoutKey, token, expires });
  }
}
