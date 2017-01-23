const agent = require('superagent-promise')(require('superagent'), Promise);

const parser = (res, callback) => {
  const result = res;
  result.data = '';
  res.setEncoding('binary');
  res.on('data', (chunk) => {
    result.data += chunk;
  });
  res.on('end', () => {
    callback(null, new Buffer(res.data, 'binary'));
  });
};

module.exports = url =>
  agent.get(url)
  .buffer(true).parse(parser).end()
  .then(data => data.body);
