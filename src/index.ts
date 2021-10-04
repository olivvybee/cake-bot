import Discord, { Message, User } from 'discord.js';
import { config as loadEnv } from 'dotenv';

import { findCommand } from './commands';
import { announceBirthdays } from './announce';
import { addServer, removeServer, DB } from './database';
import { checkNotifications } from './checkNotifications';
import { PREFIX } from './constants';
import { checkShortcuts } from './checkShortcuts';
import { cancelPing } from './commands/notify';
import { loadEmoji } from './emoji';
import { onMemberUpdate } from './events';
import { announceFreeEpicGames } from './jobs/epicGames/epicGames';
import { scheduleRecurringCallback } from './schedule';
import { onUserUpdate } from './events/userUpdate';
import { onMessageReceived } from './events/messageReceived';
import { autoPurge } from './jobs/autoPurge';
import { onMemberLeave } from './events/memberLeave';
import { runRegexCommands } from './regexCommands';
import { checkForTwitterImages } from './jobs/twitterImages';

loadEnv();

export const client = new Discord.Client();

export const runCommand = async (msg: Message) => {
  const request = msg.content
    .slice(PREFIX.length)
    .split(' ')
    .filter((word) => !!word.length);
  const code = request[0].toLowerCase();
  const params = request.slice(1);

  const command = findCommand(code);
  if (!command) {
    checkShortcuts(msg);
    return;
  }

  if (command.requiresMod) {
    const userRoles = msg.member.roles;
    const modRoles = await DB.getArrayAtPath(`modRoles/${msg.guild.id}`);

    if (
      !!modRoles.length &&
      !userRoles.find((role) => modRoles.includes(role.id))
    ) {
      console.log('tried to execute mod command without permission');
      return;
    }
  }

  command.fn(params, msg);
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  loadEmoji();

  scheduleRecurringCallback({
    callback: autoPurge,
    hour: 0,
    minute: 0,
    name: 'Auto purge',
  });

  scheduleRecurringCallback({
    callback: announceBirthdays,
    hour: 5,
    minute: 0,
    name: 'Birthday announcement',
  });

  scheduleRecurringCallback({
    callback: announceFreeEpicGames,
    hour: 17,
    minute: 0,
    name: 'Epic Games announcement',
  });

  scheduleRecurringCallback({
    callback: checkForTwitterImages,
    minute: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    name: 'Twitter image download',
  });
});

client.on('guildCreate', async (server) => {
  addServer(server.id);
  console.log(`Joined server ${server.id} (${server.name})`);
});

client.on('guildDelete', async (server) => {
  removeServer(server.id);
  console.log(`Left server ${server.id} (${server.name})`);
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  onMemberUpdate(oldMember, newMember);
});

client.on('userUpdate', (oldUser, newUser) => {
  onUserUpdate(oldUser, newUser);
});

client.on('guildMemberRemove', async (member) => {
  onMemberLeave(member);
});

client.on('message', async (msg) => {
  if (msg.member && msg.member.id) {
    checkNotifications(msg.member.id);
  }

  onMessageReceived(msg);

  if (!msg.content.toLowerCase().startsWith(PREFIX.toLowerCase())) {
    runRegexCommands(msg);
    return;
  }

  runCommand(msg);
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (reaction.emoji.name === 'CancelPing') {
    await cancelPing(reaction, user.id);
  }

  checkNotifications(user.id);
});

client.login(process.env.DISCORD_BOT_TOKEN);
