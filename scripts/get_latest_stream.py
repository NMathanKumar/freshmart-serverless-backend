import subprocess
import json
import os

env = os.environ.copy()
env['PYTHONUTF8'] = '1'

out = json.loads(subprocess.check_output([
    'aws', 'logs', 'describe-log-streams',
    '--log-group-name', '/aws/lambda/freshmart-dev-notification-service',
    '--order-by', 'LastEventTime',
    '--descending',
    '--limit', '1'
], env=env))

stream_name = out['logStreams'][0]['logStreamName']
print("LATEST STREAM NAME:", stream_name)

p = subprocess.Popen([
    'aws', 'logs', 'get-log-events',
    '--log-group-name', '/aws/lambda/freshmart-dev-notification-service',
    '--log-stream-name', stream_name
], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
stdout, _ = p.communicate()
events = json.loads(stdout.decode('utf-8', errors='ignore')).get('events', [])

for ev in events:
    msg = ev['message'].encode('ascii', errors='backslashreplace').decode('ascii')
    print(msg.strip())
