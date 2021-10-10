import { TextChannel } from 'discord.js';

import { DB } from '../database';
import { emoji } from '../emoji';
import { client } from '../index';
import { Command, CommandFn } from '../interfaces';
import { checkForGamePassGames } from '../jobs/gamePass';

const setUpGamePass: CommandFn = async (params, msg) => {
  if (params.length === 0) {
    return checkForGamePassGames();
  }

  const param = params[0];

  const channelIdStart = param.indexOf('#') + 1;
  const channelIdEnd = param.indexOf('>');
  const channelId = param.substring(channelIdStart, channelIdEnd);

  const channel = client.channels.get(channelId) as TextChannel;
  if (!channel) {
    return msg.channel.send(`${emoji.error} I couldn't find that channel.`);
  }

  const serverId = msg.guild.id;

  await DB.setPath(`gamePass/servers/${serverId}`, channelId);
};

export const gamepass: Command = {
  params: ['channel'],
  description: 'Announces new Xbox Game Pass games in the specified channel.',
  fn: setUpGamePass,
};
