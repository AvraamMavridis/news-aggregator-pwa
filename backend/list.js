const dynamodb = require('./dynamodb');

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };

  // fetch all todos from the database
  dynamodb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the items.'));
      return;
    }

    result = result || { Items: [] }; // eslint-disable-line
    let items = result.Items.slice();
    items.sort((x, y) => y.createdAt - x.createdAt);
    items = items.map(item => { // eslint-disable-line
      const time = new Date(item.createdAt);
      item.timeString = time.toLocaleTimeString(); // eslint-disable-line
      item.dateString = time.toLocaleDateString(); // eslint-disable-line
      return item;
    }).slice(0, 300);

    let body;
    try {
      body = JSON.stringify(items);
    } catch (e) {
      console.log('Error stringifying body.');
      callback(new Error('Error stringifying body.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      },
    };
    callback(null, response);
  });
};
