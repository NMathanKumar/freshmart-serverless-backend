import urllib.request
import json
import time
import statistics

token = "eyJraWQiOiIyaUtRQkJxTnA0MkF1MTc5MzRmNWQ5WEhVbElLT2RpanZUNFVVK2tKT2t3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiOWZhNDUwYy00MDAxLTcwZGUtNTg0Ni03Y2I5NDAyYmVjNTgiLCJjb2duaXRvOmdyb3VwcyI6WyJjdXN0b21lcnMiXSwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tL2FwLXNvdXRoZWFzdC0xX1JYR0tJcTg5YyIsImNsaWVudF9pZCI6IjVxZWc3dG8xZXJvc2NwNDE1czVqcWljdnQyIiwib3JpZGluX2p0aSI6ImUxM2ViMjI0LWQwNWMtNDYwOS1iMzdjLTc1OTM5YmU4MGZhYyIsImV2ZW50X2lkIjoiYWYzYTY5ODktZjhmNy00MTEwLTk2NGYtZTFlNmUwYWZhY2ViIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc4NjI2NTgzNCwiZXhwIjoxNzg2MjY5NDM0LCJpYXQiOjE3ODYyNjU4MzQsImp0aSI6ImYyZDg1MWU2LTUzYzMtNGI1Mi05YzJjLWY3ZDcwM2ZkNjc2NyIsInVzZXJuYW1lIjoiYjlmYTQ1MGMtNDAwMS03MGRlLTU4NDYtN2NiOTQwMmJlYzU4In0.JNkxKS8NoLX0xyM5VoS-cM-j3TBu_sdkRlvUAeaa8uGiP64qUOhgjER0NGID4i4ODaTfLhn4xFEKkFbPSQOZ48jbKkWzTUHO9t7l-POT1PL1lezWQBOcojN9fVvHBYjsqCVnSjXl7h0T6W4DbNb3QfQaow5sptfBEw7zagxfeoocwkrChZ14NgdT8g0KY1FVfE0u2c0SHVenn192oNl9M6izDTauNeTOHmdmSJ9xYwJq3u_fW7ha27IH3OL7lfK-kN7P1aVRcpJJtnt1b5m1NS2CtD2FWcebNpjq1JzTF62UD8fVwyamY9IMKDP9mWtAojFcTDl3DZpQCPtT7WKnBw"

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1"

status_counts = {}
durations = []
payload_sizes = []

print("=== EXECUTING 35 AUTHENTICATED CUSTOMER BFF REQUESTS ===")
headers = {
    "Authorization": f"Bearer {token}",
    "User-Agent": "FreshMart-Auth-Verification/1.0"
}

for i in range(35):
    t0 = time.time()
    req = urllib.request.Request(f"{base_url}/customer/home", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = (time.time() - t0) * 1000
            body = resp.read().decode('utf-8')
            status = resp.status
            status_counts[status] = status_counts.get(status, 0) + 1
            durations.append(elapsed)
            payload_sizes.append(len(body))
    except Exception as e:
        elapsed = (time.time() - t0) * 1000
        st = getattr(e, 'code', 'ERROR')
        status_counts[st] = status_counts.get(st, 0) + 1
        print(f"Request {i+1} Failed: {st} - {e}")
    time.sleep(0.1)

print("\n=== AUTHENTICATED BFF TRAFFIC SUMMARY ===")
print(f"Total Requests: 35")
print(f"Status Code Breakdown: {json.dumps(status_counts)}")
if durations:
    sorted_d = sorted(durations)
    print(f"Min Latency: {min(durations):.1f} ms")
    print(f"Mean Latency: {statistics.mean(durations):.1f} ms")
    print(f"p50 Latency: {sorted_d[int(len(sorted_d)*0.5)]:.1f} ms")
    print(f"p90 Latency: {sorted_d[int(len(sorted_d)*0.9)]:.1f} ms")
    print(f"p95 Latency: {sorted_d[int(len(sorted_d)*0.95)]:.1f} ms")
    print(f"Max Latency: {max(durations):.1f} ms")
    print(f"Average Payload Size: {statistics.mean(payload_sizes):.1f} bytes")
