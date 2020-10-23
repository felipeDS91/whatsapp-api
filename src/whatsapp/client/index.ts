import { Client } from 'whatsapp-web.js';
import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode-terminal';
import Message from '../../models/Message';

const SESSION_PATH = path.resolve(__dirname, '..', 'sessions');
const TEMP_SESSION_FILE_PATH = `${path.resolve(SESSION_PATH)}session.json`;

interface IReturn {
  status: 'SUCCESS' | 'ERROR' | 'FROM_NOT_FOUND';
}

class Whatsapp {
  private client: Client;

  constructor() {
    this.client = new Client({
      puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
    });

    this.client.on('qr', async qr => {
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');

      if (fs.existsSync(SESSION_PATH)) {
        fs.rename(
          TEMP_SESSION_FILE_PATH,
          `${SESSION_PATH}/${this.client.info.me.user}.json`,
          error => {
            if (error) {
              console.log('Error on change actual file session name');
              console.log(error);
            }
          },
        );
      }
    });

    this.client.on('message', msg => {
      if (msg.body === '!ping') {
        msg.reply('pong');
      }
    });

    // Save session values to the file upon successful auth
    this.client.on('authenticated', newSession => {
      console.log('Authenticated');

      fs.writeFile(TEMP_SESSION_FILE_PATH, JSON.stringify(newSession), err => {
        if (err) {
          console.log('Error on saving auth');
          console.error(err);
        }
      });
    });
  }

  private async getConnectionBack(): Promise<void> {
    try {
      await this.client.getState();
    } catch {
      await this.client.initialize();
    }
  }

  private async setClientNumber(number: string): Promise<boolean> {
    if (
      !this.client ||
      (this.client && this.client?.info?.me?.user !== `55${number}`)
    ) {
      const sessionPath = path.resolve(SESSION_PATH, `55${number}.json`);

      if (fs.existsSync(sessionPath)) {
        const session = await import(sessionPath);

        this.client = new Client({ session, takeoverOnConflict: false });

        await this.client.initialize();

        console.log('client number changed');

        return true;
      }
      return false;
    }
    await this.getConnectionBack();

    return true;
  }

  public async registerNewToken(): Promise<void> {
    this.client.initialize();
  }

  public async sendMessage(message: Message): Promise<IReturn> {
    try {
      const changedNumber = await this.setClientNumber(message.from);

      if (changedNumber) {
        await this.client.sendMessage(`55${message.to}@c.us`, message.message);
        return { status: 'SUCCESS' };
      }
      return { status: 'FROM_NOT_FOUND' };
    } catch (error) {
      console.log(error);
      return { status: 'ERROR' };
    }
  }
}

export default Whatsapp;
