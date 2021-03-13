import { Router } from 'express';
import TokensController from '../controllers/TokensController';

const tokensRouter = Router();
const tokenController = new TokensController();

tokensRouter.post('/', tokenController.create);

tokensRouter.get('/', tokenController.index);

tokensRouter.delete('/:phone', tokenController.delete);

export default tokensRouter;
