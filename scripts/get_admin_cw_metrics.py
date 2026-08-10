import boto3
import datetime
import math

cw = boto3.client('cloudwatch', region_name='ap-southeast-1')

funcs = [
    "freshmart-dev-admin-service",
    "freshmart-dev-analytics-service",
    "freshmart-dev-inventory-service",
    "freshmart-dev-warehouse-service",
    "freshmart-dev-order-service",
    "freshmart-dev-product-service",
    "freshmart-dev-user-service"
]

end = datetime.datetime.now(datetime.timezone.utc)
start = end - datetime.timedelta(hours=24)

print("=== CLOUDWATCH METRICS FOR ADMIN BACKEND SERVICES (24h) ===")
print(f"| {'Lambda Function':<35} | {'Invocations':>11} | {'Errors':>6} | {'Error Rate %':>12} | {'p50 (ms)':>8} | {'p90 (ms)':>8} | {'p95 (ms)':>8} | {'p99 (ms)':>8} | {'Max (ms)':>8} |")
print("| :" + "-"*33 + " | " + "-"*11 + ": | " + "-"*6 + ": | " + "-"*12 + ": | " + "-"*8 + ": | " + "-"*8 + ": | " + "-"*8 + ": | " + "-"*8 + ": | " + "-"*8 + ": |")

for f in funcs:
    # 1. Invocations
    res_inv = cw.get_metric_statistics(
        Namespace='AWS/Lambda', MetricName='Invocations',
        Dimensions=[{'Name': 'FunctionName', 'Value': f}],
        StartTime=start, EndTime=end, Period=86400, Statistics=['Sum']
    )
    inv = sum([p['Sum'] for p in res_inv.get('Datapoints', [])])

    # 2. Errors
    res_err = cw.get_metric_statistics(
        Namespace='AWS/Lambda', MetricName='Errors',
        Dimensions=[{'Name': 'FunctionName', 'Value': f}],
        StartTime=start, EndTime=end, Period=86400, Statistics=['Sum']
    )
    err = sum([p['Sum'] for p in res_err.get('Datapoints', [])])
    err_rate = (err / inv * 100) if inv > 0 else 0.0

    # 3. Percentiles
    res_dur = cw.get_metric_data(
        MetricDataQueries=[
            {'Id': 'p50', 'MetricStat': {'Metric': {'Namespace': 'AWS/Lambda', 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': f}]}, 'Period': 86400, 'Stat': 'p50'}},
            {'Id': 'p90', 'MetricStat': {'Metric': {'Namespace': 'AWS/Lambda', 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': f}]}, 'Period': 86400, 'Stat': 'p90'}},
            {'Id': 'p95', 'MetricStat': {'Metric': {'Namespace': 'AWS/Lambda', 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': f}]}, 'Period': 86400, 'Stat': 'p95'}},
            {'Id': 'p99', 'MetricStat': {'Metric': {'Namespace': 'AWS/Lambda', 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': f}]}, 'Period': 86400, 'Stat': 'p99'}},
            {'Id': 'max', 'MetricStat': {'Metric': {'Namespace': 'AWS/Lambda', 'MetricName': 'Duration', 'Dimensions': [{'Name': 'FunctionName', 'Value': f}]}, 'Period': 86400, 'Stat': 'Maximum'}},
        ],
        StartTime=start, EndTime=end
    )

    p50 = "N/A"
    p90 = "N/A"
    p95 = "N/A"
    p99 = "N/A"
    mmax = "N/A"

    for r in res_dur.get('MetricDataResults', []):
        vals = r.get('Values', [])
        if vals:
            v = vals[0]
            if r['Id'] == 'p50': p50 = f"{v:.1f}"
            elif r['Id'] == 'p90': p90 = f"{v:.1f}"
            elif r['Id'] == 'p95': p95 = f"{v:.1f}"
            elif r['Id'] == 'p99': p99 = f"{v:.1f}"
            elif r['Id'] == 'max': mmax = f"{v:.1f}"

    print(f"| `{f}` | {int(inv):11d} | {int(err):6d} | {err_rate:11.1f}% | {p50:>8} | {p90:>8} | {p95:>8} | {p99:>8} | {mmax:>8} |")
