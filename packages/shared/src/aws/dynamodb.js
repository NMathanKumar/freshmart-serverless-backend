const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { documentClient, config } = require('./clients');

const tableName = (name) => {
  const value = config.dynamodb.tables[name];
  if (!value) {
    throw new Error(`[CONFIG ERROR] Missing DynamoDB table for ${name}`);
  }
  return value;
};

const get = (params) => documentClient.send(new GetCommand(params));
const put = (params) => documentClient.send(new PutCommand(params));
const query = (params) => documentClient.send(new QueryCommand(params));
const update = (params) => documentClient.send(new UpdateCommand(params));
const remove = (params) => documentClient.send(new DeleteCommand(params));
const transactWrite = (params) => documentClient.send(new TransactWriteCommand(params));

module.exports = {
  tableName,
  get,
  put,
  query,
  update,
  remove,
  transactWrite,
};
