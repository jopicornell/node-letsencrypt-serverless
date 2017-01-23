const updateTXTRecord = require('../../aws/route53/updateTXTRecord');
const getHostedZoneId = require('../../aws/route53/getHostedZoneId');
const RSA = require('rsa-compat').RSA;
const crypto = require('crypto');
const dns = require('dns');
const promisify = require('es6-promisify');

const resolveTxt = promisify(dns.resolveTxt);

const getTokenDigest = (dnsChallenge, acctKeyPair) =>
  crypto.createHash('sha256').update(`${dnsChallenge.token}.${RSA.thumbprint(acctKeyPair)}`).digest();

const urlB64 = buffer => buffer.toString('base64').replace(/[+]/g, '-').replace(/\//g, '_').replace(/=/g, '');

const delayPromise = delay => data =>
  new Promise((resolve) => {
    setTimeout(() => { resolve(data); }, delay);
  });

const dnsPreCheck = (domain, expect) => tryCount =>
  resolveTxt(`_acme-challenge.${domain}`)
  .then(data => ({
    tryCount: (tryCount + 1),
    result: (data[0][0] === expect),
  }))
  .catch((e) => {
    if (e.code === 'ENODATA' || e.code === 'ENOTFOUND') {
      return { tryCount: tryCount + 1, result: false };
    } throw e;
  });

const retry = (tryCount, promise) =>
  promise(tryCount).then(delayPromise(2000))
  .then(data =>
    ((tryCount < 30 && !data.result)
      ? retry(data.tryCount, promise)
      : data),
  );

const validateDNSChallenge = (domain, dnsChallenge, acctKeyPair) =>
  retry(0, dnsPreCheck(domain, urlB64(getTokenDigest(dnsChallenge, acctKeyPair))))
  .then((data) => {
    if (data.result) {
      return data.result;
    }
    throw new Error('Could not pre-validate DNS TXT record');
  });

const updateDNSChallenge = (domain, dnsChallenge, acctKeyPair) =>
  getHostedZoneId(domain)
  .then(id => updateTXTRecord(id, domain, urlB64(getTokenDigest(dnsChallenge, acctKeyPair))))
  .then(() => validateDNSChallenge(domain, dnsChallenge, acctKeyPair))
  .catch((e) => {
    console.log('Couldn\'t write token digest to DNS record.');
    throw e;
  });

module.exports = updateDNSChallenge;
