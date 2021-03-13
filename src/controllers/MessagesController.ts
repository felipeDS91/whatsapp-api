import { parseISO } from 'date-fns';
import { Request, Response } from 'express';
import { getCustomRepository, ILike } from 'typeorm';
import AppError from '../errors/AppError';
import MessagesRepository from '../repositories/MessagesRepository';
import CreateMessageService from '../services/CreateMessageService';

const RES_PER_PAGE = 10;

interface IQueryParams {
  page: number;
  q: string;
}

export default class MessagesController {
  public async create(request: Request, response: Response): Promise<Response> {
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
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { page = 1, q } = (request.query as unknown) as IQueryParams;

    const messagesRepository = getCustomRepository(MessagesRepository);

    const [messages, total] = await messagesRepository.findAndCount({
      take: RES_PER_PAGE,
      skip: (page - 1) * RES_PER_PAGE,
      where: q && { status: q },
      order: { created_at: 'DESC' },
    });

    const pages = Math.ceil(total / RES_PER_PAGE);

    return response.json({
      total,
      pages,
      limit: RES_PER_PAGE,
      page: Number(page),
      docs: messages,
    });
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const messagesRepository = getCustomRepository(MessagesRepository);
    const messages = await messagesRepository.findOne(request.params.id);

    if (!messages) {
      throw new AppError('Message not found', 404);
    }

    return response.json(messages);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
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
  }
}
