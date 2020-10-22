import { getRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import User from '../models/User';
import AppError from '../errors/AppError';

interface Request {
  username: string;
  password: string;
  admin: boolean;
}

class CreateUserService {
  public async execute({ username, password, admin }: Request): Promise<User> {
    const usersRepository = getRepository(User);

    const checkUserExists = await usersRepository.findOne({
      where: { username },
    });

    if (checkUserExists) {
      throw new AppError('E-mail already exists.');
    }

    const hashdKey = await hash(password, 8);

    const newUser = usersRepository.create({
      username,
      admin,
      password: hashdKey,
    });

    await usersRepository.save(newUser);

    return newUser;
  }
}

export default CreateUserService;
