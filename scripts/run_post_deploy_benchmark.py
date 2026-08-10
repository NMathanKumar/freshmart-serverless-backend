import urllib.request
import json
import time
import statistics

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1"

results = {
    "/customer/home": [],
    "/products": [],
    "/categories": []
}

print("=== EXECUTING 15 WARM BENCHMARK ITERATIONS FOR FRESH CLOUDWATCH METRICS ===")
for i in range(15):
    for path in results.keys():
        url = f"{base_url}{path}"
        req = urllib.request.Request(url, headers={"User-Agent": "FreshMart-Verification/1.0"})
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                elapsed = (time.time() - t0) * 1000
                results[path].append(elapsed)
        except Exception as e:
            print(f"Error requesting {path}: {e}")
    time.sleep(0.1)

print("\n=== POST-DEPLOYMENT LATENCY SUMMARY (MILLISECONDS) ===")
print("| Endpoint | Requests | Min (ms) | Mean (ms) | p50 (ms) | p90 (ms) | p95 (ms) | Max (ms) |")
print("| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |")
for path, times in results.items():
    if times:
        sorted_t = sorted(times)
        p50 = sorted_t[int(len(sorted_t) * 0.5)]
        p90 = sorted_t[int(len(sorted_t) * 0.9)]
        p95 = sorted_t[int(len(sorted_t) * 0.95)]
        mean_t = statistics.mean(times)
        min_t = min(times)
        max_t = max(times)
        print(f"| `{path}` | {len(times)} | {min_t:.1f} | {mean_t:.1f} | {p50:.1f} | {p90:.1f} | {p95:.1f} | {max_t:.1f} |")
