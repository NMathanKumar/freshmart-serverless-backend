const { v4: uuidv4 } = require('uuid');

/**
 * Generates a prefixed UUID, e.g. genId('FOOD') -> 'FOOD_3f1c2b...'
 * Prefixes make IDs self-describing in logs, DB rows, and Postman tests,
 * and they map cleanly to DynamoDB partition keys if/when we migrate.
 */
const genId = (prefix) => `${prefix}_${uuidv4()}`;

module.exports = { genId };
