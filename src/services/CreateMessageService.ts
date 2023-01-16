import { getCustomRepository } from 'typeorm';
import { isBefore } from 'date-fns';

import Message from '../models/Message';
import MessagesRepository from '../repositories/MessagesRepository';
import AppError from '../errors/AppError';
import { saveLocalImage } from '../utils/saveMedia';
import { validateBase64Image } from '../utils/functions';

interface Request {
  from: string;
  to: string;
  message: string;
  image?: string;
  schedule_date?: Date;
}

class CreateMessageService {
  public async execute({
    from,
    to,
    message,
    image,
    schedule_date,
  }: Request): Promise<Message> {
    const messagesRepository = getCustomRepository(MessagesRepository);

    const fromSize = from.length;
    if (fromSize > 11 || fromSize < 10) {
      throw new AppError('Invalid number from');
    }

    const toSize = to.length;

    if (toSize < 10 || toSize > 22) {
      throw new AppError('Invalid number to');
    }

    if (!message) {
      throw new AppError('Invalid message');
    }

    if (schedule_date && isBefore(schedule_date, new Date())) {
      throw new AppError('Invalid schedule date');
    }

    const media_path = !!image && validateBase64Image(image) ? await saveLocalImage(image) : undefined;

    const newMessage = messagesRepository.create({
      from,
      to,
      message,
      media_path,
      schedule_date,
    });

    await messagesRepository.save(newMessage);

    return newMessage;
  }
}

export default CreateMessageService;

