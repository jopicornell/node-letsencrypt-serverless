const generateRSAKeyPair = require('../../util/generateRSAKeyPair');
const register = require('./register');
const saveFile = require('../../aws/s3/saveFile');

const saveAccount = (S3AccountBucket, S3Folder, accountFile) => (data) => {
  const account = {
    key: data.keypair,
    url: data.location,
    agreement: data.agreement,
  };
  return saveFile(
    S3AccountBucket,
    S3Folder,
    accountFile,
    JSON.stringify(account),
  )
  .then(() => account);
};

const createAccount = (regUrl, email, directoryUrl, S3AccountBucket, S3Folder, accountFile) =>
  generateRSAKeyPair()
  .then(register(regUrl, email, directoryUrl))
  .then(saveAccount(S3AccountBucket, S3Folder, accountFile));

module.exports = createAccount;
