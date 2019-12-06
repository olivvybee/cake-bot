import { Command, CommandFn } from '../interfaces';
import { DB } from '../database';
import { PREFIX } from '../constants';
import { deleteAfterDelay } from '../messages';
import { pluralise } from '../strings';

const random = (max: number) => Math.floor(Math.random() * max);

const promptCommand: CommandFn = async (params, msg) => {
  const serverId = msg.guild.id;
  const channel = msg.channel;

  if (params.length === 0) {
    const serverPrompts = await DB.getPath(`prompts/${serverId}`);
    if (!serverPrompts || !Object.keys(serverPrompts).length) {
      return channel.send("There aren't any prompts saved at the moment. 😔");
    }

    const keys = Object.keys(serverPrompts);

    const chosenIndex = random(keys.length);
    const selectedKey = keys[chosenIndex];
    const selectedPrompt = serverPrompts[selectedKey];

    await DB.deletePath(`prompts/${serverId}/${selectedKey}`);

    return channel.send(`You should draw... ${selectedPrompt}.`);
  }

  if (params.length === 1 && params[0] === 'count') {
    const serverPrompts = await DB.getPath(`prompts/${serverId}`);
    if (!serverPrompts || !Object.keys(serverPrompts).length) {
      return channel.send("There aren't any prompts saved at the moment. 😔");
    }

    const count = Object.keys(serverPrompts).length;
    if (count === 1) {
      return channel.send('There is currently 1 prompt saved.');
    } else {
      return channel.send(`There are currently ${count} prompts saved.`);
    }
  }

  const promptToAdd = params.join(' ');
  await DB.pushAtPath(`prompts/${serverId}`, promptToAdd);

  const sentMessage = await channel.send(`✅ Got it!`);
  deleteAfterDelay(msg, sentMessage);
};

export const prompt: Command = {
  description: `Gets a random drawing prompt using "${PREFIX}prompt" or saves a new drawing prompt, e.g. "${PREFIX}prompt sleeping tiger".`,
  params: [],
  fn: promptCommand
};
