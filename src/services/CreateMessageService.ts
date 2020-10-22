import { getCustomRepository } from 'typeorm';
import { isBefore } from 'date-fns';

import Message from '../models/Message';
import MessagesRepository from '../repositories/MessageRepository';
import AppError from '../errors/AppError';

interface Request {
  from: string;
  to: string;
  message: string;
  schedule_date?: Date;
}

class CreateMessageService {
  public async execute({
    from,
    to,
    message,
    schedule_date,
  }: Request): Promise<Message> {
    const messagesRepository = getCustomRepository(MessagesRepository);

    const numberSize = to.length;

    if (numberSize > 11 || numberSize < 10) {
      throw new AppError('Invalid number to');
    }

    if (!message) {
      throw new AppError('Invalid message');
    }

    if (schedule_date && isBefore(schedule_date, new Date())) {
      throw new AppError('Invalid schedule date');
    }

    const newMessage = messagesRepository.create({
      from,
      to,
      message,
      schedule_date,
    });

    await messagesRepository.save(newMessage);

    return newMessage;
  }
}

export default CreateMessageService;
