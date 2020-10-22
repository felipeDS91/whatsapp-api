import { Router } from 'express';
import UsersController from '../controllers/UsersController';

const usersRouter = Router();
const userController = new UsersController();

usersRouter.post('/', userController.create);

usersRouter.delete('/', userController.delete);

export default usersRouter;
