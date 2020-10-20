import { Client } from 'whatsapp-web.js';
import Message from '../../models/Message';

interface IParams {
  client: Client;
  message: Message;
}

class SendMessageService {
  public async execute({ client, message }: IParams): Promise<void> {
    try {
      const state = await client.getState();
      console.log(`Connection state:${state}`);
    } catch (e) {
      console.log(e);
      console.log('Attempting to recover connection...');
      client.initialize();
    }

    await client.sendMessage(`55${message.to}@c.us`, message.message);
    console.log(`Message to ${message.to} sendeed`);
  }
}

export default SendMessageService;
