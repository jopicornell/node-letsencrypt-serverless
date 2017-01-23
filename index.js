const generateCertificate = require('./src/acme/generateCertificate');
const isExpired = require('./src/util/isExpired');

const single = (domain, config) =>
  isExpired(domain)
  .then(expired =>
    (expired
      ? generateCertificate(domain, config)
      : {
        err: false,
        msg: `Certificate for ${domain} is still valid, going back to bed.`,
      }
    ),
  )
  .catch(err => ({
    err: true,
    msg: `Updating cert for ${domain}, received err ${err}, ${err.stack}`,
  }));

const certificates = domains => domains.map(single);

const updateCertificates = config => (options, context) =>
  Promise.all(certificates(config['acme-domains'], config))
  .then(msgs => context.succeed(msgs));

module.exports = updateCertificates;
