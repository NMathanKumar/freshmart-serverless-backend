import subprocess
import json
import os

env = os.environ.copy()
env['PYTHONUTF8'] = '1'

out = json.loads(subprocess.check_output([
    'aws', 'logs', 'describe-log-streams',
    '--log-group-name', '/aws/lambda/freshmart-dev-inventory-service',
    '--order-by', 'LastEventTime',
    '--descending',
    '--limit', '10'
], env=env))

streams = out.get('logStreams', [])
for s in streams:
    sname = s['logStreamName']
    p = subprocess.Popen([
        'aws', 'logs', 'get-log-events',
        '--log-group-name', '/aws/lambda/freshmart-dev-inventory-service',
        '--log-stream-name', sname
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    stdout, _ = p.communicate()
    events = json.loads(stdout.decode('utf-8', errors='ignore')).get('events', [])
    for ev in events:
        msg = ev['message'].encode('ascii', errors='backslashreplace').decode('ascii')
        if 'ERROR' in msg or 'Error' in msg or 'error' in msg or 'Exception' in msg:
            print(f"[{sname}] {msg.strip()}")
