import { Router } from 'express';
import NewTokenController from '../controllers/NewTokenController';

const newTokenRouter = Router();
const newTokenController = new NewTokenController();

newTokenRouter.post('/', newTokenController.create);

export default newTokenRouter;
