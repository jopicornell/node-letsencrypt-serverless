const generateRSAKeyPair = require('../../util/generateRSAKeyPair');
const newCertificate = require('./newCertificate');
const generateCSR = require('../../util/generateCSR');
const saveFile = require('../../aws/s3/saveFile');

const saveCertificate = (data, S3Bucket, S3Folder) =>
  saveFile(
    S3Bucket,
    S3Folder,
    `${data.domain}.json`,
    JSON.stringify({
      key: data.keypair,
      cert: data.cert,
      issuerCert: data.issuerCert,
    }),
  );

const createCertificate = (certUrl, authorizations, domain, acctKeyPair, S3Bucket, S3Folder) =>
  generateRSAKeyPair()
  .then(domainKeypair =>
    generateCSR(domainKeypair, [domain])
    .then(newCertificate(acctKeyPair, authorizations, certUrl))
    .then(certData =>
      saveCertificate({
        domain,
        keypair: domainKeypair,
        cert: certData.cert,
        issuerCert: certData.issuerCert,
      }, S3Bucket, S3Folder),
    ),
  );

module.exports = createCertificate;
