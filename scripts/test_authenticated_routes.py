import urllib.request
import json
import time

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1"

# Step 1: Login as customer
login_payload = json.dumps({"email": "customer@freshmart.com", "password": "Password123!"}).encode("utf-8")
req_login = urllib.request.Request(
    f"{base_url}/auth/login",
    data=login_payload,
    headers={"Content-Type": "application/json", "User-Agent": "FreshMart-Verification/1.0"}
)

token = None
try:
    with urllib.request.urlopen(req_login, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        token = data.get("data", {}).get("accessToken") or data.get("accessToken") or data.get("token")
        print(f"[AUTH SUCCESS] Obtained JWT Token: {token[:20] if token else 'None'}...")
except Exception as e:
    print(f"[AUTH LOGIN NOTE] Default customer login: {e}")

# If login token obtained, test authenticated routes 10 times to measure latency
auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

print("\n=== MEASURING POST-DEPLOYMENT LATENCY OVER 10 REQUESTS ===")
for i in range(10):
    for path in ["/customer/home", "/products", "/categories"]:
        url = f"{base_url}{path}"
        req = urllib.request.Request(url, headers=auth_headers)
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                elapsed = (time.time() - t0) * 1000
                # print snippet
        except Exception as e:
            pass
    time.sleep(0.2)

print("Batch test completed.")
