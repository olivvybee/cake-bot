import { Command, CommandFn } from '../interfaces';
import { client } from '..';
import { RichEmbed } from 'discord.js';

const listServersFn: CommandFn = async (params, msg) => {
  const servers = client.guilds.array();
  console.log(servers);

  const list = new RichEmbed();
  list.setTitle('Current servers');

  servers.forEach((server) =>
    list.addField(`${server.name} (${server.memberCount} members)`, server.id)
  );

  msg.channel.send(list);
};

export const listServers: Command = {
  params: [],
  description: 'Lists the servers the bot is currently a member of.',
  hidden: true,
  requiresMod: true,
  fn: listServersFn,
};
