const getDiscoveryUrls = require('./getDiscoveryUrls');
const getAccount = require('./register/getAccount');
const getChallenges = require('./authorize/getChallenges');
const getCertificate = require('./certify/getCertificate');

module.exports = (domain, config) =>
  getDiscoveryUrls(config.acmeDirectoryUrl)
  .then(urls =>
    getAccount(urls['new-reg'], config.email, config.acmeDirectoryUrl, config.S3AccountBucket, config.S3Folder, config.accountFile)
    .then(account =>
      getChallenges(domain, account.key, urls['new-authz'], config.acmeDirectoryUrl)
      .then(getCertificate(urls['new-cert'], domain, account.key, config.S3Bucket, config.S3Folder)),
    ),
  );
