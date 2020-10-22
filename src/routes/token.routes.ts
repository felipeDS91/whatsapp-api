import { Router } from 'express';
import TokensController from '../controllers/TokensController';

const tokenRouter = Router();
const tokenController = new TokensController();

tokenRouter.post('/', tokenController.create);

export default tokenRouter;
