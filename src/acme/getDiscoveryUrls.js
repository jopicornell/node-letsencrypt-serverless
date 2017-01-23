const Promise = require('bluebird');
const agent = require('superagent-promise')(require('superagent'), Promise);

const getDiscoveryUrls = acmeDirectoryUrl =>
  agent.get(`${acmeDirectoryUrl}/directory`)
  .then(data => data.body);

module.exports = getDiscoveryUrls;
