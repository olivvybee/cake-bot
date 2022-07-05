import { Command } from '../interfaces';

import { help } from './help';
import { ping } from './ping';
import { list } from './list';
import { set } from './set';
import { birthday } from './birthday';
import { update } from './update';
import { channel } from './channel';
import { role } from './role';
import { notify } from './notify';
import { user } from './user';
import { users } from './users';
import { colour } from './colour';
import { mod } from './mod';
import { unmod } from './unmod';
import { echo } from './echo';
import { edit } from './edit';
import { breadify } from './breadify';
import { logging } from './logging';
import { shortcut } from './shortcut';
import { emoji } from './emoji';
import { prompt } from './prompt';
import { hug } from './hug';
import { contrast } from './contrast';
import { avatar } from './avatar';
import { otter } from './otter';
import { eightBall } from './8ball';
import { gif } from './gif';
import { epicgames } from './epicgames';
import { minesweeper } from './minesweeper';
import { autopurge } from './autopurge';
import { choose } from './choose';
import { song } from './song';
import { twitterimages } from './twitterImages';
import { gamepass } from './gamePass';
import { listServers as listservers } from './listservers';
import { leaveServer as leaveserver } from './leaveserver';

export const COMMANDS: { [code: string]: Command } = {
  help,
  // ping,
  // list,
  set,
  birthday,
  update,
  notify,
  prompt,
  hug,
  channel,
  role,
  user,
  users,
  colour,
  mod,
  unmod,
  echo,
  edit,
  breadify,
  contrast,
  avatar,
  otter,
  choose,
  logging,
  shortcut,
  emoji,
  '8ball': eightBall,
  gif,
  epicgames,
  minesweeper,
  autopurge,
  song,
  twitterimages,
  gamepass,
  listservers,
  leaveserver,
};

export const findCommand = (name: string) => {
  const foundName = Object.keys(COMMANDS).find((command) => {
    if (command === name) {
      return true;
    }

    const aliases = COMMANDS[command].aliases || [];
    return aliases.includes(name);
  });

  if (!foundName) {
    return undefined;
  }

  return COMMANDS[foundName];
};
