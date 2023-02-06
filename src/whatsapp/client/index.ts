/* eslint-disable no-await-in-loop */
import WAWebJS, { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import Message from '../../models/Message';
import CreateTokenService from '../../services/CreateTokenService';
import AppError from '../../errors/AppError';
import fs from 'fs';
import appRoot from 'app-root-path';

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
const REGEX_REMOVE_BASE64_HEADER = new RegExp(/data:image\/[bmp,gif,ico,jpg,png,svg,webp,x\-icon,svg+xml]+;base64,/);

class Whatsapp {
  private client: Client;

  private sessionToSave: string | undefined;

  private qrCodeImage: string | undefined;

  constructor() {

  }

  private async finalizeClient(): Promise<void> {
    if (this.client != null) {
      await this.client.destroy();
    }
  }

  private deleteSessionPath(clientId: string): void {
    const sessionPath = appRoot.path + '/tokens/session-' + clientId;
    console.log(`erasing path: ${sessionPath}`);
    fs.rmdirSync(sessionPath, { recursive: true });
  }

  private async initializeClient(clientId: string = "") {

    await this.finalizeClient();

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: 'tokens', clientId: clientId }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--unhandled-rejections=strict',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
      },
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
          phone: this.client.info.wid.user,
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

    this.client.on('authenticated', (session) => {
      console.log('Authenticated');
      this.sessionToSave = JSON.stringify(session || 'multidevice');
    });

    this.client.initialize().then();
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
    const from = `${process.env.DEFAULT_DDI}${number}`;

    const connectedWithWrongFromNumber = this.client?.info?.me?.user !== from;

    if (!this.client || connectedWithWrongFromNumber) {

      await this.finalizeClient();

      this.client = new Client({
        authStrategy: new LocalAuth({ dataPath: 'tokens', clientId: from }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--unhandled-rejections=strict',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ],
        },
      });

      await this.client.initialize().catch(_ => _);

      console.log(`client number changed to ${from}`);

      return true;

    }
    await this.getConnectionBack();

    return true;
  }

  public async registerNewToken(number: string): Promise<string> {
    const from = `${process.env.DEFAULT_DDI}${number}`;

    this.qrCodeImage = undefined;

    this.deleteSessionPath(from);

    this.initializeClient(from);

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

      const { _serialized: numberId } = await this.client.getNumberId(id);

      return numberId;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async getFormattedId(id: string): Promise<string | undefined> {
    const numberType = id.length > DEFAULT_PHONE_LENGTH ? '@g.us' : '@c.us';

    if (numberType === '@c.us') {
      const formattedNumber = `${process.env.DEFAULT_DDI}${id}${numberType}`;
      const verifiedNumber = await this.getIdByNumber(formattedNumber);

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

  public async sendMessage({ from, to, message, media }: Message): Promise<IReturn> {
    try {
      const definedFrom = await this.setFromClient(from);
      if (!definedFrom) return { status: 'FROM_NOT_FOUND' };

      if (await this.isDisconnected()) return { status: 'FROM_DISCONNECTED' };

      const formattedTo = await this.getFormattedId(to);
      if (!formattedTo) return { status: 'TO_NOT_FOUND' };

      if (!!media) {
        const base64Media = media.replace(REGEX_REMOVE_BASE64_HEADER, "");
        const messageMedia = new MessageMedia('image/png', base64Media);
        await this.client.sendMessage(formattedTo, messageMedia, { caption: message });
      } else {
        await this.client.sendMessage(formattedTo, message);
      }

      return { status: 'SUCCESS' };
    } catch (error) {
      console.error(`fail to send message. description: ${error}`);
      return { status: 'ERROR' };
    }
  }
}

export default Whatsapp;
