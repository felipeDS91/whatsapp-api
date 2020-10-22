/* eslint-disable no-await-in-loop */
import 'dotenv/config';
import 'reflect-metadata';
import '../database';

import { getCustomRepository } from 'typeorm';
import { sleepRandomTime } from '../utils/functions';

import MessagesRepository from '../repositories/MessageRepository';

import Whatsapp from './client';

const whatsapp = new Whatsapp();

let checking = false;

const checkMessages = async () => {
  if (checking) return;
  checking = true;

  console.log('checking new messages');
  try {
    const messagesRepository = getCustomRepository(MessagesRepository);
    const messages = await messagesRepository.findMessagesToSend();

    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];

      const { status } = await whatsapp.sendMessage(message);

      await messagesRepository.save({ ...message, status });

      await sleepRandomTime({
        minMilliseconds: process.env.MIN_SLEEP_INTERVAL,
        maxMilliseconds: process.env.MAX_SLEEP_INTERVAL,
      });
    }
  } catch (error) {
    console.log(error);
  }
  checking = false;
};

setInterval(checkMessages, process.env.CHECK_INTERVAL);
