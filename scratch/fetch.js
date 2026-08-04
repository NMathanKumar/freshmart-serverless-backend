const { execSync } = require('child_process');
const ts = Date.now() - 15 * 60 * 1000;
try {
  const result = execSync(`aws logs filter-log-events --log-group-name /aws/lambda/freshmart-dev-auth-service --start-time ${ts} --limit 50`, { encoding: 'utf8' });
  const events = JSON.parse(result).events;
  for (const e of events) {
    console.log(e.message.trim());
  }
} catch (e) {
  console.error(e.message);
}
