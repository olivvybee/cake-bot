import { TextChannel } from 'discord.js';
import { TweetV1TimelineResult } from 'twitter-api-v2';
import _chunk from 'lodash/chunk';

import { DB } from '../database';
import { client } from '../index';
import { twitterClient } from '../twitter';

const findNewTweets = async (serverId: string) => {
  const server = client.guilds.get(serverId);
  if (!server) {
    console.error(`Invalid server id ${serverId}`);
    return [];
  }

  const twitterConfigs = await DB.getPath(`twitterImages/${serverId}/accounts`);

  if (Object.keys(twitterConfigs).length === 0) {
    console.error(`No twitter accounts set up for server ${serverId}`);
    return [];
  }

  let tweets: TweetV1TimelineResult = [];

  for (const username of Object.keys(twitterConfigs)) {
    const lastTweetId = twitterConfigs[username].lastTweet;

    const userTimeline = await twitterClient.userTimelineByUsername(username, {
      since_id: lastTweetId || undefined,
    });

    const userTweets = userTimeline.tweets.filter(
      (tweet) => tweet.id_str !== lastTweetId
    );

    if (userTweets.length === 0) {
      continue;
    }

    const newLastTweetId = userTweets[0].id_str;
    await DB.setPath(
      `twitterImages/${serverId}/accounts/${username}/lastTweet`,
      newLastTweetId
    );

    tweets = tweets.concat(userTweets);
  }

  return tweets;
};

export const checkForTwitterImages = async () => {
  const servers = await DB.getPath('twitterImages');

  if (!servers) {
    return;
  }

  Object.keys(servers).forEach(async (serverId) => {
    const tweets = await findNewTweets(serverId);

    const imageUrls = tweets.reduce<string[]>((urls, tweet) => {
      const tweetUrls =
        tweet.extended_entities?.media
          ?.filter((media) => !!media && media.type === 'photo')
          .map((media) => media.media_url_https + '?name=4096x4096') || [];

      return [...urls, ...tweetUrls];
    }, []);

    const channelId = servers[serverId].channel;
    const channel = client.channels.get(channelId) as TextChannel;

    _chunk(imageUrls, 5).forEach((batch) => channel.send(batch.join('\n')));
  });
};
