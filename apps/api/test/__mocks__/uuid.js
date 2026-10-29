const crypto = require('crypto');

const NIL = '00000000-0000-0000-0000-000000000000';

function v4() {
  return crypto.randomUUID ? crypto.randomUUID() : '12345678-1234-4234-8234-123456789abc';
}

function v1() {
  return v4();
}

function validate(uuid) {
  return typeof uuid === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

function parse(str) {
  return Buffer.from(str.replace(/-/g, ''), 'hex');
}

function stringify(buf) {
  return buf.toString('hex');
}

function version(uuid) {
  return 4;
}

module.exports = {
  v4,
  v1,
  validate,
  parse,
  stringify,
  version,
  NIL,
  default: {
    v4,
    v1,
    validate,
    parse,
    stringify,
    version,
    NIL,
  },
};
