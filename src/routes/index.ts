import { Router } from 'express';
import messagesRouter from './messages.routes';
import usersRouter from './users.routes';
import sessionsRouter from './sessions.routes';
import tokensRouter from './tokens.routes';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdminOnly from '../middlewares/ensureAdminOnly';

const routes = Router();

routes.use('/sessions', sessionsRouter);

routes.use(ensureAuthenticated);

routes.use('/messages', messagesRouter);
routes.use('/users', ensureAdminOnly, usersRouter);
routes.use('/tokens', ensureAdminOnly, tokensRouter);

export default routes;
