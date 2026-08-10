import subprocess
import json
import datetime

funcs = [
    'freshmart-dev-product-service',
    'freshmart-dev-customer-bff-service',
    'freshmart-dev-notification-service',
    'freshmart-dev-cart-service',
    'freshmart-dev-order-service',
    'freshmart-dev-user-service'
]

print("=== FRESH CLOUDWATCH METRICS POST-DEPLOYMENT ===")
print('| Lambda Function | Invocations | Errors | Error Rate % | p50 (ms) | p90 (ms) | p95 (ms) | p99 (ms) | Max (ms) |')
print('| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')

# Get last 2 hours to capture post-deployment traffic window
now = datetime.datetime.now(datetime.timezone.utc)
start_time = (now - datetime.timedelta(hours=2)).strftime('%Y-%m-%dT%H:%M:%SZ')
end_time = now.strftime('%Y-%m-%dT%H:%M:%SZ')

for fn in funcs:
    cmd_dur = [
        'aws', 'cloudwatch', 'get-metric-statistics',
        '--namespace', 'AWS/Lambda',
        '--metric-name', 'Duration',
        '--dimensions', f'Name=FunctionName,Value={fn}',
        '--start-time', start_time,
        '--end-time', end_time,
        '--period', '7200',
        '--extended-statistics', 'p50', 'p90', 'p95', 'p99',
        '--statistics', 'Average', 'Maximum', 'SampleCount'
    ]
    cmd_inv = [
        'aws', 'cloudwatch', 'get-metric-statistics',
        '--namespace', 'AWS/Lambda',
        '--metric-name', 'Invocations',
        '--dimensions', f'Name=FunctionName,Value={fn}',
        '--start-time', start_time,
        '--end-time', end_time,
        '--period', '7200',
        '--statistics', 'Sum'
    ]
    cmd_err = [
        'aws', 'cloudwatch', 'get-metric-statistics',
        '--namespace', 'AWS/Lambda',
        '--metric-name', 'Errors',
        '--dimensions', f'Name=FunctionName,Value={fn}',
        '--start-time', start_time,
        '--end-time', end_time,
        '--period', '7200',
        '--statistics', 'Sum'
    ]

    dur_data = json.loads(subprocess.check_output(cmd_dur))
    inv_data = json.loads(subprocess.check_output(cmd_inv))
    err_data = json.loads(subprocess.check_output(cmd_err))

    dp = dur_data['Datapoints'][0] if dur_data.get('Datapoints') else {}
    inv = int(inv_data['Datapoints'][0]['Sum']) if inv_data.get('Datapoints') else 0
    err = int(err_data['Datapoints'][0]['Sum']) if err_data.get('Datapoints') else 0
    err_pct = f'{(err/inv*100):.1f}%' if inv > 0 else '0.0%'

    ext = dp.get('ExtendedStatistics', {})
    p50 = round(ext.get('p50', 0), 1) if 'p50' in ext else 'N/A'
    p90 = round(ext.get('p90', 0), 1) if 'p90' in ext else 'N/A'
    p95 = round(ext.get('p95', 0), 1) if 'p95' in ext else 'N/A'
    p99 = round(ext.get('p99', 0), 1) if 'p99' in ext else 'N/A'
    max_d = round(dp.get('Maximum', 0), 1) if 'Maximum' in dp else 'N/A'

    print(f'| `{fn}` | {inv} | {err} | {err_pct} | {p50} | {p90} | {p95} | {p99} | {max_d} |')
