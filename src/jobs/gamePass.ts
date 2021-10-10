import { RichEmbed, TextChannel } from 'discord.js';

import { client } from '../index';
import { DB } from '../database';
import { notUndefined } from '../notUndefined';
import { twitterClient } from '../twitter';

const LAST_TWEET_PATH = 'gamePass/lastTweet';
const SERVERS_PATH = 'gamePass/servers';
const GAME_PASS_TWITTER_USERNAME = 'xboxgamepassuk';

const extractGameNames = (text: string) => {
  return text
    .split('\n')
    .filter((line, index) => index > 0 && !!line && !!line.length)
    .map((line) => line.substr(2, line.indexOf('-') - 2))
    .map((line) => line.trim())
    .filter((line) => !!line.length);
};

const findNewGamePassGames = async () => {
  const lastTweetId = await DB.getPath(LAST_TWEET_PATH);

  const timeline = await twitterClient.userTimelineByUsername(
    GAME_PASS_TWITTER_USERNAME,
    {
      since_id: lastTweetId || undefined,
      exclude_replies: true,
    }
  );

  const tweets = timeline.tweets.filter(
    (tweet) => tweet.id_str !== lastTweetId
  );

  if (tweets.length === 0) {
    return [];
  }

  const newLastTweetId = tweets[0].id_str;
  // await DB.setPath(LAST_TWEET_PATH, newLastTweetId);

  const announcementTweets = tweets.filter(
    (tweet) =>
      tweet.full_text && tweet.full_text.match(/available ((now)|(today))/i)
  );

  return announcementTweets
    .map((tweet) => tweet.full_text)
    .filter(notUndefined)
    .map(extractGameNames)
    .reduce((all, item) => all.concat(item), []);
};

export const checkForGamePassGames = async () => {
  const newGames = await findNewGamePassGames();

  if (!newGames || !newGames.length) {
    return;
  }

  const embed = new RichEmbed();
  embed.title = 'New Game Pass games available';
  embed.description = newGames?.map((game) => `• ${game}`).join('\n');

  const servers = await DB.getPath(SERVERS_PATH);
  if (!servers) {
    return;
  }

  Object.keys(servers).forEach((serverId) => {
    const channelId = servers[serverId];
    const channel = client.channels.get(channelId) as TextChannel;
    if (channel) {
      channel.send(embed);
    }
  });
};
