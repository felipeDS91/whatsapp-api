import { Router } from 'express';
import messagesRouter from './messages.routes';
import usersRouter from './users.routes';
import sessionsRouter from './sessions.routes';
import tokensRouter from './tokens.routes';
import contactsRouter from './contacts.routes';
import screenshotRouter from './screenshot.routes';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import ensureAdminOnly from '../middlewares/ensureAdminOnly';

const routes = Router();

routes.use('/sessions', sessionsRouter);

routes.use(ensureAuthenticated);

routes.use('/messages', messagesRouter);
routes.use('/users', ensureAdminOnly, usersRouter);
routes.use('/tokens', ensureAdminOnly, tokensRouter);
routes.use('/contacts', ensureAdminOnly, contactsRouter);
routes.use('/screenshot', ensureAdminOnly, screenshotRouter);

export default routes;
