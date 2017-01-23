const readFile = require('../../aws/s3/readFile');
const createAccount = require('./createAccount');

const getAccount = (regUrl, email, directoryUrl, S3AccountBucket, S3Folder, accountFile) =>
  readFile(
    S3AccountBucket,
    S3Folder,
    accountFile,
  )
  .then(data => JSON.parse(data.Body.toString()))
  .catch(() => {
    console.log(`Creating user config file since couldn't read s3://${S3AccountBucket}/${S3Folder}/${accountFile}`);
    return createAccount(regUrl, email, directoryUrl, S3AccountBucket, S3Folder, accountFile);
  });

module.exports = getAccount;
