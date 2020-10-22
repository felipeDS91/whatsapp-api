import { Router } from 'express';

import Whatsapp from '../whatsapp/client';

const tokenRouter = Router();

tokenRouter.post('/', async (request, response) => {
  const whatsapp = new Whatsapp();
  await whatsapp.registerNewToken();

  return response.status(200).send();
});

export default tokenRouter;
