const monk = require('monk');
const db = monk('localhost/auth-intro-app');

module.exports = db;