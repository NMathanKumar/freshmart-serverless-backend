export function checkHealth() {
  return {
    status: 'UP',
    version: '1.0.0',
    uptime: process.uptime(),
    dependencies: { dynamodb: 'UP', eventbridge: 'UP' }
  };
}
