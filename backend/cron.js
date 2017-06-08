const FeedParser = require('feedparser');
const request = require('request');
const hash = require('string-hash');
const dynamodb = require('./dynamodb');

const parseFeed = function (feed) {
  const url = feed.url;
  console.log(`Parsing ${url}`);
  console.log('Dynamo Table', process.env.DYNAMODB_TABLE);
  return new Promise((resolve, reject) => {
    let req = request(url);
    let feedparser = new FeedParser();

    req.on('response', function (res) {
      let stream = this; // `this` is `req`, which is a stream

      if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'));
      } else {
        stream.pipe(feedparser);
      }
    });

    feedparser.on('error', (err) => {
      console.log('Parser Error', err);
    });

    feedparser.on('readable', function () {
      // This is where the action is!
      const stream = this; // `this` is `feedparser`, which is a stream
      let item;

      const promises = [];
      while (item = stream.read()) {
        const timestamp = new Date().getTime();
        const params = {
          TableName: process.env.DYNAMODB_TABLE,
          Item: {
            id: `${hash(item.title)}`,
            title: item.title,
            link: item.link,
            description: item.description,
            image: item.image,
            createdAt: timestamp,
            updatedAt: timestamp,
            source: feed.source,
          },
        };

        promises.push(new Promise((resolve, reject) => {
          dynamodb.put(params, (err, data) => {
            console.log('Putting to db...');
            if (err) reject(err);
            else resolve(data);
          });
        }));
      }

      Promise
        .all(promises)
        .then((data) => {
          console.log('PUSHED TO DB', url);
          resolve(data);
        })
        .catch(err => console.log('ERROR PUSHING TO DB', err));
    });
  });
};

const feeds = [
  {
    url: 'http://www.protothema.gr/rss/',
    source: 'ΠΡΩΤΟ ΘΕΜΑ',
  },
  {
    url: 'http://www.newsit.gr/rss/artrss.php',
    source: 'ΝΕWSIT',
  },
  {
    url: 'http://www.enikos.gr/rss/latest.xml',
    source: 'ENIKOS',
  },
  {
    url: 'http://www.newsbomb.gr/oles-oi-eidhseis?format=feed&type=rss',
    source: 'NEWSBOMB',
  },
  {
    url: 'http://rss.in.gr/feed/news',
    source: 'IN.GR',
  },
  {
    url: 'http://www.athensmagazine.gr/rss/feeds/articles/articles-timeline.xml',
    source: 'ATHENS MAGAZINE',
  },
  {
    url: 'http://www.pronews.gr/apprss/all',
    source: 'PRONEWS',
  },
  {
    url: 'http://www.capital.gr/api/tags/allfeed',
    source: 'CAPITAL.GR',
  },
  {
    url: 'http://www.huffingtonpost.gr/feeds/verticals/greece/index.xml',
    source: 'HUFFINGTONPOST',
  },
  {
    url: 'http://feeds.feedburner.com/skai/Uulu?format=xml',
    source: 'ΣΚΑΪ',
  },
];

module.exports.run = (event, context, callback) => {
  const promises = feeds.map(parseFeed);

  Promise
    .all(promises)
    .then((data) => {
      const response = {
        statusCode: 200,
        body: null,
      };
      console.log('DATA', data);
      callback(null, response);
    })
    .catch((error) => {
      console.log(error);
      callback(error);
    });
};
