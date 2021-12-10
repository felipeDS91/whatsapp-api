/* eslint-disable no-await-in-loop */
import WAWebJS, { Client } from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import { getCustomRepository } from 'typeorm';
import Message from '../../models/Message';
import CreateTokenService from '../../services/CreateTokenService';
import TokensRepository from '../../repositories/TokensRepository';
import AppError from '../../errors/AppError';

declare global {
  interface Window {
    WWebJS: any;
  }
}

interface IReturn {
  status:
    | 'SUCCESS'
    | 'ERROR'
    | 'FROM_NOT_FOUND'
    | 'FROM_DISCONNECTED'
    | 'TO_NOT_FOUND';
}

const DEFAULT_PHONE_LENGTH = 11;

class Whatsapp {
  private client: Client;

  private sessionToSave: string | undefined;

  private qrCodeImage: string | undefined;

  constructor() {
    this.client = new Client({
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      qrRefreshIntervalMs: 150000,
    });

    this.client.on('qr', async qr => {
      this.qrCodeImage = await qrcode.toDataURL(qr);
      qrcodeTerminal.generate(qr, { small: true });
    });

    this.client.on('ready', async () => {
      console.log('Client is ready!');

      if (this.sessionToSave) {
        const createToken = new CreateTokenService();

        await createToken.execute({
          phone: this.client.info.me.user,
          token: this.sessionToSave,
        });

        this.sessionToSave = undefined;
      }
    });

    this.client.on('message', msg => {
      if (msg.body === '!ping') {
        msg.reply('pong');
      }
    });

    // Save session values to temporary prop
    this.client.on('authenticated', newSession => {
      console.log('Authenticated');
      this.sessionToSave = JSON.stringify(newSession);
    });
  }

  private async sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  private async getConnectionBack(): Promise<void> {
    try {
      await this.client.getState();
    } catch {
      await this.client.initialize();
    }
  }

  private async readTimeout(ms: number): Promise<void> {
    await this.sleep(ms);

    if (this.client) {
      console.log('read qrcode timeout reached');
      await this.client.destroy();
    }
  }

  private async setFromClient(number: string): Promise<boolean> {
    const connectedWithWrongFromNumber =
      this.client?.info?.me?.user !== `${process.env.DEFAULT_DDI}${number}`;

    if (!this.client || connectedWithWrongFromNumber) {
      const tokenRepository = getCustomRepository(TokensRepository);

      const token = await tokenRepository.findByPhone(
        `${process.env.DEFAULT_DDI}${number}`,
      );

      if (token) {
        this.client = new Client({
          session: JSON.parse(token.token),
          takeoverOnConflict: false,
          puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        });

        await this.client.initialize().catch(_ => _);

        console.log('client number changed');

        return true;
      }

      return false;
    }
    await this.getConnectionBack();

    return true;
  }

  public async registerNewToken(): Promise<string> {
    this.qrCodeImage = undefined;

    this.client.initialize().catch(_ => _);

    while (!this.qrCodeImage) {
      await this.sleep(100);
    }

    this.readTimeout(process.env.READ_QRCODE_TIMEOUT);

    return this.qrCodeImage;
  }

  public async getContacts(from: string): Promise<WAWebJS.Contact[]> {
    const definedFrom = await this.setFromClient(from);
    if (!definedFrom)
      throw new AppError(`error to connect with phone number ${from}`);

    if (await this.isDisconnected())
      throw new AppError(`phone number ${from} disconnected`);

    const contacts = await this.client.getContacts();

    return contacts;
  }

  private async getIdByNumber(id: string) {
    try {
      const number = await this.client.pupPage?.evaluate(id => {
        return window.WWebJS.getNumberId(id);
      }, id);

      // eslint-disable-next-line no-underscore-dangle
      return number._serialized;
    } catch {
      return null;
    }
  }

  private async getFormattedId(id: string): Promise<string | undefined> {
    const numberType = id.length > DEFAULT_PHONE_LENGTH ? '@g.us' : '@c.us';

    if (numberType === '@c.us') {
      const verifiedNumber = await this.getIdByNumber(
        `${process.env.DEFAULT_DDI}${id}${numberType}`,
      );

      return verifiedNumber;
    }
    return `${process.env.DEFAULT_DDI}${id}${numberType}`;
  }

  private async isDisconnected(): Promise<boolean> {
    try {
      const status = await this.client.getState();
      return status !== 'CONNECTED';
    } catch {
      return true;
    }
  }

  public async sendMessage(message: Message): Promise<IReturn> {
    try {
      const definedFrom = await this.setFromClient(message.from);
      if (!definedFrom) return { status: 'FROM_NOT_FOUND' };

      if (await this.isDisconnected()) return { status: 'FROM_DISCONNECTED' };

      const to = await this.getFormattedId(message.to);
      if (!to) return { status: 'TO_NOT_FOUND' };

      await this.client.sendMessage(to, message.message);
      return { status: 'SUCCESS' };
    } catch (error) {
      console.error(error);
      return { status: 'ERROR' };
    }
  }
}

export default Whatsapp;
