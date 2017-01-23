const readFile = require('../../aws/s3/readFile');
const createCertificate = require('./createCertificate');

const getCertificate = (certUrl, domain, acctKeyPair, S3Bucket, S3Folder) => authorizations =>
  readFile(
    S3Bucket,
    S3Folder,
    `${domain}.json`,
  )
  .then(data => JSON.parse(data.Body.toString()))
  .catch(() => {
    console.log(`Creating domain since couldn't read s3://${S3Bucket}/${S3Folder}/${domain}.json`);
    return createCertificate(certUrl, authorizations, domain, acctKeyPair);
  });

module.exports = getCertificate;
