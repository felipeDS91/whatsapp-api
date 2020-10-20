import { getRepository } from 'typeorm';
import { hash } from 'bcryptjs';
import User from '../models/User';

interface Request {
  name: string;
  key: string;
}

class CreateUserService {
  public async execute({ name, key }: Request): Promise<User> {
    const usersRepository = getRepository(User);

    const checkUserExists = await usersRepository.findOne({
      where: { name },
    });

    if (checkUserExists) {
      throw new Error('Email já cadastrado.');
    }

    const hashdKey = await hash(key, 8);

    const newUser = usersRepository.create({
      name,
      key: hashdKey,
    });

    await usersRepository.save(newUser);

    return newUser;
  }
}

export default CreateUserService;
