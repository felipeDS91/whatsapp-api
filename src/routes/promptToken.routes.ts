import { Router } from 'express';
import PromptTokenController from '../controllers/PromptTokenController';

const promptTokenRouter = Router();
const promptTokenController = new PromptTokenController();

promptTokenRouter.post('/', promptTokenController.create);

export default promptTokenRouter;
