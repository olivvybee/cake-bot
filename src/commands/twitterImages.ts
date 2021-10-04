import { TwitterApi } from 'twitter-api-v2';

import { DB } from '../database';
import { emoji } from '../emoji';
import { Command, CommandFn } from '../interfaces';
import { checkForTwitterImages } from '../jobs/twitterImages';

const setUpTwitterImages: CommandFn = async (params, msg) => {
  if (params.length === 0) {
    return checkForTwitterImages();
  }

  const [username] = params;
  const serverId = msg.guild.id;

  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '')
    .readOnly.v1;
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
