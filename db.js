const knex = require('knex');
require('dotenv').config();
const config = require('./knexfile').development;

const db = knex(config);

module.exports = db;
