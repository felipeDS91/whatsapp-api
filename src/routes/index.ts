import { Router } from 'express';
import messagesRouter from './messages.routes';
import usersRouter from './users.routes';
import sessionsRouter from './sessions.routes';
import tokenRouter from './token.routes';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdminOnly from '../middlewares/ensureAdminOnly';

const routes = Router();

routes.use('/sessions', sessionsRouter);

routes.use(ensureAuthenticated);

routes.use('/messages', messagesRouter);
routes.use('/users', ensureAdminOnly, usersRouter);
routes.use('/token', ensureAdminOnly, tokenRouter);

export default routes;
