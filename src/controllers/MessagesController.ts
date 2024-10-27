import { parseISO } from 'date-fns';
import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import MessagesRepository from '../repositories/MessagesRepository';
import CreateMessageService from '../services/CreateMessageService';

const RES_PER_PAGE = 10;

interface IQueryParams {
  page: number;
  q: string;
}

export default class MessagesController {
  private messagesRepository = getCustomRepository(MessagesRepository);

  public async create(request: Request, response: Response): Promise<Response> {
    try {
      const { from, to, message, image, schedule_date } = request.body;

      const parsedScheduleDate = schedule_date
        ? parseISO(schedule_date)
        : undefined;

      const createMessage = new CreateMessageService();

      const newMessage = await createMessage.execute({
        from,
        to,
        message,
        image,
        schedule_date: parsedScheduleDate,
      });

      return response.status(201).json(newMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      throw new AppError('Failed to create message', 500);
    }
  }

  public async index(request: Request, response: Response): Promise<Response> {
    try {
      const { page = 1, q } = request.query as unknown as IQueryParams;

      const [messages, total] = await this.messagesRepository.findAndCount({
        select: ['id', 'status', 'from', 'to', 'message', 'schedule_date', 'created_at', 'updated_at'],
        take: RES_PER_PAGE,
        skip: (Number(page) - 1) * RES_PER_PAGE,
        where: q ? { status: q } : {},
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
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new AppError('Failed to fetch messages', 500);
    }
  }

  public async show(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;
      const message = await this.messagesRepository.findOne(id);

      if (!message) {
        throw new AppError('Message not found', 404);
      }

      return response.json(message);
    } catch (error) {
      console.error('Error fetching message:', error);
      throw new AppError('Failed to fetch message', 500);
    }
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      const message = await this.messagesRepository.findOne(id);

      if (!message) {
        throw new AppError('Message not found', 404);
      }

      if (message.status !== 'WAITING') {
        throw new AppError('The message has already been processed', 400);
      }

      await this.messagesRepository.remove(message);

      return response.status(200).send();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new AppError('Failed to delete message', 500);
    }
  }
}
