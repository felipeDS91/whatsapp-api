import { Router } from 'express';

import Whatsapp from '../whatsapp/client';

const tokenRouter = Router();

tokenRouter.post('/', async (request, response) => {
  try {
    const whatsapp = new Whatsapp();
    await whatsapp.client.initialize();

    return response.status(200).send();
  } catch ({ message }) {
    return response.status(400).json({ message });
  }
});

export default tokenRouter;
