const sendSignedRequest = require('../sendSignedRequest');
const downloadBinary = require('../../util/downloadBinary');

const toIssuerCert = (links) => {
  const match = /.*<(.*)>;rel="up".*/.exec(links);
  return match[1];
};


const toStandardB64 = (str) => {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');
  switch (b64.length % 4) {
    case 2: b64 += '=='; break;
    case 3: b64 += '='; break;
    default: break;
  }
  return b64;
};

const toPEM = (cert) => {
  let certificate = toStandardB64(cert.toString('base64'));
  certificate = certificate.match(/.{1,64}/g).join('\n');
  return `-----BEGIN CERTIFICATE-----\n${certificate}\n-----END CERTIFICATE-----\n`;
};

const newCertificate = (keypair, authorizations, certUrl, acmeDirectoryUrl) => csr =>
  sendSignedRequest({
    resource: 'new-cert',
    csr,
    authorizations,
  }, keypair, certUrl, acmeDirectoryUrl)
  .then(data =>
    downloadBinary(data.header.location)
    .then(certificate =>
      downloadBinary(toIssuerCert(data.header.link))
      .then(issuerCert =>
        ({
          cert: toPEM(certificate),
          issuerCert: toPEM(issuerCert),
        }),
      ),
    ),
  );

module.exports = newCertificate;
