/* eslint-disable no-await-in-loop */
import WAWebJS, { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcodeTerminal from 'qrcode-terminal';
import qrcode from 'qrcode';
import Message from '../../models/Message';
import CreateTokenService from '../../services/CreateTokenService';
import fs from 'fs';
import * as path from 'path';
import appRoot from 'app-root-path';
import { addMilliseconds, isAfter } from 'date-fns';
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
const NEW_FORMAT_GROUP_LENGTH = 18;
const TYPE_GROUP = '@g.us';
const TYPE_CONTACT = '@c.us';
const REGEX_REMOVE_BASE64_HEADER = new RegExp(
  /data:image\/[bmp,gif,ico,jpg,png,svg,webp,x\-icon,svg+xml]+;base64,/,
);

class Whatsapp {
  private clients: Map<string, Client> = new Map();

  // Repository with all versions: https://github.com/wppconnect-team/wa-version/tree/main/html
  // Always use the raw version
  private remotePath: string =
    'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html';

  private sessionToSave: string | undefined;

  private qrCodeImage: string | undefined;

  private isReady: Map<string, boolean> = new Map();

  constructor() {}

  private async finalizeClient(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client != null) {
      await client.destroy();
      this.clients.delete(clientId);
      this.isReady.delete(clientId);
    }
  }

  public deleteSessionPath(clientId: string): void {
    try {
      const sessionPath = path.join(
        appRoot.path,
        'tokens',
        '/session-' + clientId,
      );
      console.log(`erasing path: ${sessionPath}`);
      fs.rmdirSync(sessionPath, { recursive: true });
    } catch (error) {
      console.error('fail to erase path');
      console.error(error);
    }
  }

  private async initializeClientWithAuth(clientId: string = '') {
    await this.finalizeClient(clientId);

    const client = new Client({
      authStrategy: new LocalAuth({ dataPath: 'tokens', clientId: clientId }),
      puppeteer: {
        headless: process.env.NODE_ENV !== 'development',
        args: [
          '--no-sandbox',
          '--unhandled-rejections=strict',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
      // webVersionCache: {
      //   type: 'remote',
      //   remotePath: this.remotePath,
      // },
    });

    this.clients.set(clientId, client);

    client.on('qr', async qr => {
      this.qrCodeImage = await qrcode.toDataURL(qr);
      qrcodeTerminal.generate(qr, { small: true });
    });

    client.on('ready', async () => {
      console.log('Client is ready!');

      if (this.sessionToSave) {
        const createToken = new CreateTokenService();

        await createToken.execute({
          phone: client.info.wid.user,
          token: this.sessionToSave,
        });

        this.sessionToSave = undefined;

        // Destroy the client after saving the token
        await this.finalizeClient(clientId);
        console.log('Client destroyed after saving token');
      }
    });

    client.on('message', msg => {
      if (msg.body === '!ping') {
        msg.reply('pong');
      }
    });

    client.on('authenticated', session => {
      console.log('Authenticated');
      this.sessionToSave = JSON.stringify(session || 'multidevice');
    });

    client.initialize().then();
  }

  private async initializeClient(clientId: string = '') {
    this.isReady.set(clientId, false);

    await this.finalizeClient(clientId);

    const client = new Client({
      authStrategy: new LocalAuth({ dataPath: 'tokens', clientId: clientId }),
      puppeteer: {
        headless: process.env.NODE_ENV !== 'development',
        args: [
          '--no-sandbox',
          '--unhandled-rejections=strict',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      },
      // webVersionCache: {
      //   type: 'remote',
      //   remotePath: this.remotePath,
      // },
    });

    this.clients.set(clientId, client);

    client.on('ready', async () => {
      console.log('Client is ready!');
      this.isReady.set(clientId, true);
    });
    client.initialize().catch(_ => console.error(_));
  }

  private async sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  private async getConnectionBack(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client) {
      try {
        await client.getState();
      } catch {
        await client.initialize();
      }
    }
  }

  private async readTimeout(clientId: string, ms: number): Promise<void> {
    await this.sleep(ms);

    const client = this.clients.get(clientId);
    if (client) {
      console.warn('read qrcode timeout reached');
      await this.finalizeClient(clientId);
    }
  }

  private async setFromClient(number: string): Promise<boolean> {
    const from = `${process.env.DEFAULT_DDI}${number}`;

    const client = this.clients.get(from);

    if (!client) {
      console.log('starting client ' + from);
      this.initializeClient(from);
      const authTimeout = addMilliseconds(new Date(), process.env.AUTH_TIMEOUT);
      while (!(this.isReady.get(from) || false)) {
        if (isAfter(new Date(), authTimeout)) {
          console.error('auth timeout reached');
          return false;
        }
        await this.sleep(100);
      }

      console.log(`client number changed to ${from}`);

      return true;
    }
    await this.getConnectionBack(from);

    return true;
  }

  public async registerNewToken(number: string): Promise<string> {
    const from = `${process.env.DEFAULT_DDI}${number}`;

    this.qrCodeImage = undefined;

    this.deleteSessionPath(from);

    this.initializeClientWithAuth(from);

    while (!this.qrCodeImage) {
      await this.sleep(100);
    }

    this.readTimeout(from, process.env.READ_QRCODE_TIMEOUT);

    return this.qrCodeImage;
  }

  public async getContacts(from: string): Promise<WAWebJS.Contact[]> {
    const definedFrom = await this.setFromClient(from);
    if (!definedFrom)
      throw new AppError(`error to connect with phone number ${from}`);

    const client = this.clients.get(`${process.env.DEFAULT_DDI}${from}`);
    if (!client || await this.isDisconnected(`${process.env.DEFAULT_DDI}${from}`))
      throw new AppError(`phone number ${from} disconnected`);

    const contacts = await client.getContacts();

    return contacts;
  }

  private async getIdByNumber(clientId: string, id: string) {
    const client = this.clients.get(clientId);
    if (!client) return null;
    try {
      const { _serialized: numberId } = await client.getNumberId(id);

      return numberId;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  private async getFormattedId(clientId: string, id: string): Promise<string | undefined> {
    const numberType =
      id.length > DEFAULT_PHONE_LENGTH ? TYPE_GROUP : TYPE_CONTACT;

    if (numberType === TYPE_CONTACT) {
      const formattedNumber = `${process.env.DEFAULT_DDI}${id}${numberType}`;
      const verifiedNumber = await this.getIdByNumber(clientId, formattedNumber);
      return verifiedNumber;
    }
    if (numberType === TYPE_GROUP && id.length === NEW_FORMAT_GROUP_LENGTH) {
      const formattedNumber = `${id}${numberType}`;
      return formattedNumber;
    }
    return `${process.env.DEFAULT_DDI}${id}${numberType}`;
  }

  private async isDisconnected(clientId: string): Promise<boolean> {
    const client = this.clients.get(clientId);
    if (!client) return true;
    try {
      const status = await client.getState();
      return status !== 'CONNECTED';
    } catch {
      return true;
    }
  }

  async takeScreenshot(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;
    try {
      await client.pupPage?.screenshot({ path: 'screenshot.png' });
      console.log('screenshot done');
    } catch (error) {
      console.warn(`fail to take screenshot. description:${error}`);
    }
  }

  public async sendMessage({
    from,
    to,
    message,
    media,
  }: Message): Promise<IReturn> {
    const clientId = `${process.env.DEFAULT_DDI}${from}`;
    try {
      const definedFrom = await this.setFromClient(from);
      if (!definedFrom) throw { status: 'FROM_NOT_FOUND' };

      if (await this.isDisconnected(clientId)) throw { status: 'FROM_DISCONNECTED' };

      const formattedTo = await this.getFormattedId(clientId, to);
      if (!formattedTo) throw { status: 'FROM_NOT_FOUND' };

      const client = this.clients.get(clientId);
      if (!client) throw { status: 'FROM_NOT_FOUND' };

      if (!!media) {
        const base64Media = media.replace(REGEX_REMOVE_BASE64_HEADER, '');
        const messageMedia = new MessageMedia('image/png', base64Media);
        await client.sendMessage(formattedTo, messageMedia, {
          caption: message,
        });
      } else {
        await client.sendMessage(formattedTo, message);
      }

      return { status: 'SUCCESS' };
    } catch (error) {
      console.error(
        `fail to send message. description: ${JSON.stringify(error)}`,
      );

      await this.takeScreenshot(clientId);
      await this.finalizeClient(clientId);

      const status = error.status ? error.status : 'ERROR';
      return { status };
    }
  }
}

export default Whatsapp;
