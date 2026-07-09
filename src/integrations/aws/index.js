module.exports = {
  awsConfig: require('./aws.config'),
  ...require('./aws.client'),
  ...require('./aws.errors'),
  ...require('./aws.logger'),
};
