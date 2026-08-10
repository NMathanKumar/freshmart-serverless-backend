import subprocess
import json
import os
import sys

env = os.environ.copy()
env['PYTHONUTF8'] = '1'

out = json.loads(subprocess.check_output([
    'aws', 'logs', 'describe-log-streams',
    '--log-group-name', '/aws/lambda/freshmart-dev-notification-service',
    '--order-by', 'LastEventTime',
    '--descending',
    '--limit', '10'
], env=env))

streams = out.get('logStreams', [])
for s in streams:
    sname = s['logStreamName']
    p = subprocess.Popen([
        'aws', 'logs', 'get-log-events',
        '--log-group-name', '/aws/lambda/freshmart-dev-notification-service',
        '--log-stream-name', sname
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    stdout, _ = p.communicate()
    events = json.loads(stdout.decode('utf-8', errors='ignore')).get('events', [])
    if events:
        print(f"=== STREAM: {sname} ({len(events)} events) ===")
        for ev in events:
            msg = ev['message'].encode('ascii', 'backslashreplace').decode('ascii')
            if 'Email started' in msg or 'Email sent' in msg or 'to' in msg:
                print("  ", msg.strip())
