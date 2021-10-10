import { DB } from '../database';
import { Command, CommandFn } from '../interfaces';
import { checkForTwitterImages } from '../jobs/twitterImages';
import { twitterClient } from '../twitter';

const setUpTwitterImages: CommandFn = async (params, msg) => {
  if (params.length === 0) {
    return checkForTwitterImages();
  }

  const [username] = params;
  const serverId = msg.guild.id;

  const userTimeline = await twitterClient.userTimelineByUsername(username);
  const lastTweetId = userTimeline.tweets[0].id_str;

  await DB.setPath(
    `twitterImages/${serverId}/accounts/${username}/lastTweet`,
    lastTweetId
  );
  await DB.setPath(`twitterImages/${serverId}/channel`, msg.channel.id);
};

export const twitterimages: Command = {
  params: ['username'],
  description:
    'Periodically looks for images posted by a specific twitter user and posts them in the current channel.',
  fn: setUpTwitterImages,
};
