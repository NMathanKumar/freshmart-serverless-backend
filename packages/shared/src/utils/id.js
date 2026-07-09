const { v4: uuidv4 } = require('uuid');

const genId = (prefix) => `${prefix}_${uuidv4()}`;

module.exports = { genId };
