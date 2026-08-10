import urllib.request
import json
import time

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1"

endpoints = [
    ("/customer/home", "GET"),
    ("/products", "GET"),
    ("/categories", "GET"),
    ("/customer/notifications", "GET"),
]

print("=== SENDING TEST TRAFFIC TO DEPLOYED ROUTE PATHS ===")
for path, method in endpoints:
    url = f"{base_url}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "FreshMart-Verification/1.0"})
    start = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            duration = round((time.time() - start) * 1000, 2)
            print(f"[{resp.status}] {method} {path} - {duration}ms | Payload length: {len(body)} bytes")
    except Exception as e:
        duration = round((time.time() - start) * 1000, 2)
        print(f"[FAIL] {method} {path} - {duration}ms: {e}")

print("Test traffic generation complete.")
