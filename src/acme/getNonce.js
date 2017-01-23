const agent = require('superagent-promise')(require('superagent'), Promise);

const getNonce = acmeDirectoryUrl =>
  agent.get(`${acmeDirectoryUrl}/directory`)
  .end()
  .then(data => data.header['replay-nonce'])
  .catch((e) => {
    console.error(`Error getting nonce ${JSON.stringify(e)}`);
    throw e;
  });

module.exports = getNonce;
