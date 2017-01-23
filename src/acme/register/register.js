const sendSignedRequest = require('../sendSignedRequest');

const toAgreement = (links) => {
  const match = /.*<(.*)>;rel="terms-of-service".*/.exec(links);
  return (Array.isArray(match) ? { agreement: match[1] } : {});
};

const sendRefresh = registration =>
  sendSignedRequest({
    resource: 'reg',
    agreement: registration.agreement,
  }, registration.keypair, registration.location, registration.acmeDirectoryUrl);

const refreshRegistration = registration =>
  sendRefresh(registration)
  .then(data => ({ data, registration }));

const checkRefresh = (registration, data) => {
  const refreshedAgreement = toAgreement(data.header.link);
  return ((registration.agreement !== refreshedAgreement.agreement)
    ? refreshRegistration({
      keypair: registration.keypair,
      location: registration.location,
      agreement: refreshedAgreement.agreement,
      acmeDirectoryUrl: registration.acmeDirectoryUrl,
    })
    .then(payload => checkRefresh(payload.registration, payload.data))
    : Promise.resolve({
      keypair: registration.keypair,
      location: registration.location,
      agreement: registration.agreement,
      acmeDirectoryUrl: registration.acmeDirectoryUrl,
    }));
};

const register = (regUrl, email, acmeDirectoryUrl) => keypair =>
  sendSignedRequest({
    resource: 'new-reg',
    contact: [`mailto:${email}`],
  }, keypair, regUrl, acmeDirectoryUrl)
  .then(data =>
    refreshRegistration(
      Object.assign({
        keypair,
        location: data.header.location,
        acmeDirectoryUrl,
      },
      toAgreement(data.header.link)),
    ),
  );

module.exports = register;
