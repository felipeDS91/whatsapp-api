import { Router } from 'express';
import MessagesController from '../controllers/MessagesController';

const messagesRouter = Router();
const messageController = new MessagesController();

messagesRouter.get('/', messageController.show);

messagesRouter.get('/:id', messageController.index);

messagesRouter.delete('/:id', messageController.delete);

messagesRouter.post('/', messageController.create);

export default messagesRouter;
