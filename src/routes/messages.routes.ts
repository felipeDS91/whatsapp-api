import { Router } from 'express';
import { parseISO } from 'date-fns';
import { getCustomRepository } from 'typeorm';

import MessagesRepository from '../repositories/MessageRepository';
import CreateMessageService from '../services/CreateMessageService';
import AppError from '../errors/AppError';

const messagesRouter = Router();

messagesRouter.get('/', async (request, response) => {
  const messagesRepository = getCustomRepository(MessagesRepository);
  const messages = await messagesRepository.find();

  return response.json(messages);
});

messagesRouter.get('/:id', async (request, response) => {
  const messagesRepository = getCustomRepository(MessagesRepository);
  const messages = await messagesRepository.findOne(request.params.id);

  if (!messages) {
    throw new AppError('Message not found', 404);
  }

  return response.json(messages);
});

messagesRouter.delete('/:id', async (request, response) => {
  const messagesRepository = getCustomRepository(MessagesRepository);
  const message = await messagesRepository.findOne(request.params.id);

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  if (message.status !== 'WAITING') {
    throw new AppError('The message has already been processed');
  }

  messagesRepository.delete(message);

  return response.status(200).send();
});

messagesRouter.post('/', async (request, response) => {
  const { from, to, message, schedule_date } = request.body;

  const parsedScheduleDate = schedule_date
    ? parseISO(schedule_date)
    : undefined;

  const createMessage = new CreateMessageService();

  const newMessage = await createMessage.execute({
    from,
    to,
    message,
    schedule_date: parsedScheduleDate,
  });

  return response.json(newMessage);
});

export default messagesRouter;
