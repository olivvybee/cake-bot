import { Command, CommandFn } from '../interfaces';
import { client } from '..';
import { RichEmbed } from 'discord.js';
import { emoji } from '../emoji';

const leaveServerFn: CommandFn = async (params, msg) => {
  if (params.length < 1) {
    return;
  }

  const serverId = params[0];

  const server = client.guilds.get(serverId);
  if (!server) {
    await msg.channel.send(`${emoji.error} I couldn't find that server.`);
    return;
  }

  await server.leave();

  return msg.channel.send(`${emoji.success} Successfully left server.`);
};

export const leaveServer: Command = {
  params: ['serverId'],
  description: 'Leaves the server with the given id.',
  hidden: true,
  requiresMod: true,
  fn: leaveServerFn,
};
