import subprocess
import json
import time
import statistics

durations = []

print("=== EXECUTING 10 REAL NOTIFICATION DISPATCHES ===")
for i in range(10):
    payload = json.dumps({
        'detail-type': 'OrderPlaced.v1',
        'source': 'freshmart.order-service',
        'detail': {
            'order': {
                'orderId': f'FM-VERIFY-BATCH-{i+1}',
                'userId': f'USER-{i+1}',
                'totalAmount': 19.99 + i
            }
        }
    })

    t0 = time.time()
    out = subprocess.check_output([
        'aws', 'lambda', 'invoke',
        '--function-name', 'freshmart-dev-notification-service',
        '--payload', payload,
        '--cli-binary-format', 'raw-in-base64-out',
        'response.json'
    ])
    
    with open('response.json', 'r') as f:
        res = json.loads(f.read())
        elapsed = res.get('processingTimeMs', (time.time() - t0) * 1000)
        durations.append(elapsed)
        print(f"[{i+1}/10] Status: {res.get('status')} | Processing Time: {elapsed}ms | NotificationId: {res.get('result', {}).get('notificationId')}")
    
    time.sleep(0.2)

sorted_d = sorted(durations)
print("\n=== NOTIFICATION SERVICE EXECUTION LATENCY ===")
print(f"Invocations: {len(durations)}")
print(f"Min: {min(durations):.1f} ms")
print(f"Mean: {statistics.mean(durations):.1f} ms")
print(f"p50: {sorted_d[int(len(sorted_d)*0.5)]:.1f} ms")
print(f"p95: {sorted_d[int(len(sorted_d)*0.95)]:.1f} ms")
print(f"Max: {max(durations):.1f} ms")
