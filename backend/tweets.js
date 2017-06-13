const Twitter = require('twitter');
const hash = require('string-hash');
const dynamodb = require('./dynamodb');

const client = new Twitter({
  consumer_key: '47S7qFlXTb2D48At88piHg',
  consumer_secret: 'cgFcW4bRTzCdNMuWrKq7T7sOMVeTQki5zvvbkHAupA',
  access_token_key: '27063126-Yjf0AuTRkUP8GnIWydOobxV746tthCcVcXzeg4tRU',
  access_token_secret: 'gG0SPfKMZdIUMdznFumoapZXcW9yUwzuvdf5AFQRgSlnn',
});
const sources = require('./tweetsconfig');
const flatten = require('lodash/flatten');

const createChunk = function createChunk(arr, len) {
  const chunks = [];
  let i = 0;
  const n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }

  return chunks;
};


module.exports.get = (event, context, callback) => {
  const promises = [];

  sources.forEach((source) => {
    promises.push(new Promise((resolve, reject) => {
      const params = { screen_name: source.screen_name, count: 5 };
      client.get('statuses/user_timeline', params, (error, tweets) => {
        if (error) reject(error);
        resolve(tweets.map((i) => {
          const item = {};
          item.title = i.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').trim();
          item.title = item.title.replace(/(@\S+)/gi, '');
          item.title = item.title.replace(/(#\S+)/gi, '');
          item.title = item.title.replace('via @tanea', '').trim();
          item.title = item.title.replace(/\s\s+/g, ' ');
          item.source = source.source;
          item.createdAt = new Date(i.created_at).getTime();
          item.updatedAt = new Date().getTime();
          item.description = '-';
          if (i.entities.media && i.entities.media[0]) {
            item.image = i.entities.media[0].media_url_https;
          }
          if (i.entities.urls && i.entities.urls[0]) {
            item.link = i.entities.urls[0].expanded_url;
          }
          item.image = item.image || '-';
          return item;
        }));
      });
    }));
  });

  Promise.all(promises)
  .then((items) => {
    let itemsToPut = flatten(items).map((item) => {
      const params = {
        PutRequest: {
          Item: {
            id: `${hash(item.title)}`,
            title: item.title,
            link: item.link,
            image: item.image,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            source: item.source,
          },
        },
      };

      return params;
    });

    itemsToPut = itemsToPut.filter(it => Boolean(it.title) && Boolean(it.link));

    const chunks = createChunk(itemsToPut, 20);
    const promises2 = [];
    chunks.forEach((chunkItems) => {
      const params = {
        RequestItems: {
          [`${process.env.DYNAMODB_TABLE}`]: chunkItems,
        },
      };

      promises2.push(new Promise((resolve, reject) => {
        dynamodb.batchWrite(params, (err) => {
          if (err) {
            console.log('>>>>>>ERROR1', err);
            reject(err);
          } else resolve(chunkItems);
        });
      }));
    });

    Promise.all(promises2)
    .then(() => {
      const response = {
        statusCode: 200,
        body: flatten(items),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*', // Required for CORS support to work
          'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
        },
      };
      console.log('ITEMS SAVED ON DB');
      callback(null, response);
    })
    .catch((e) => {
      console.log('>>>>>>ERROR2', e);
      callback(e);
    });
  })
  .catch((e) => {
    console.log('>>>>>>ERROR3', e);
    callback(e);
  });
};
