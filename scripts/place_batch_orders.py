import urllib.request
import json
import time

token = "eyJraWQiOiIyaUtRQkJxTnA0MkF1MTc5MzRmNWQ5WEhVbElLT2RpanZUNFVVK2tKT2t3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiOWZhNDUwYy00MDAxLTcwZGUtNTg0Ni03Y2I5NDAyYmVjNTgiLCJjb2duaXRvOmdyb3VwcyI6WyJjdXN0b21lcnMiXSwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tL2FwLXNvdXRoZWFzdC0xX1JYR0tJcTg5YyIsImNsaWVudF9pZCI6IjVxZWc3dG8xZXJvc2NwNDE1czVqcWljdnQyIiwib3JpZGluX2p0aSI6ImUxM2ViMjI0LWQwNWMtNDYwOS1iMzdjLTc1OTM5YmU4MGZhYyIsImV2ZW50X2lkIjoiYWYzYTY5ODktZjhmNy00MTEwLTk2NGYtZTFlNmUwYWZhY2ViIiwidG9rZW5fdXNlIjoiaWQiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzg2MjY1ODM0LCJleHAiOjE3ODYyNjk0MzQsImlhdCI6MTc4NjI2NTgzNCwiaXRpIjoiZjJkODUxZTYtNTNjMy00YjUyLTljMmMtZjdkNzAzZmQ2NzY3IiwidXNlcm5hbWUiOiJiOWZhNDUwYy00MDAxLTcwZGUtNTg0Ni03Y2I5NDAyYmVjNTgifQ.JNkxKS8NoLX0xyM5VoS-cM-j3TBu_sdkRlvUAeaa8uGiP64qUOhgjER0NGID4i4ODaTfLhn4xFEKkFbPSQOZ48jbKkWzTUHO9t7l-POT1PL1lezWQBOcojN9fVvHBYjsqCVnSjXl7h0T6W4DbNb3QfQaow5sptfBEw7zagxfeoocwkrChZ14NgdT8g0KY1FVfE0u2c0SHVenn192oNl9M6izDTauNeTOHmdmSJ9xYwJq3u_fW7ha27IH3OL7lfK-kN7P1aVRcpJJtnt1b5m1NS2CtD2FWcebNpjq1JzTF62UD8fVwyamY9IMKDP9mWtAojFcTDl3DZpQCPtT7WKnBw"

# Get fresh idToken first
from subprocess import check_output
import json

auth_out = json.loads(check_output([
    'aws', 'cognito-idp', 'initiate-auth',
    '--auth-flow', 'USER_PASSWORD_AUTH',
    '--client-id', '5qeg7to1eroscp415s5jqicvt2',
    '--auth-parameters', 'USERNAME=verify-1786075082235@freshmart-test.com,PASSWORD=Password123!'
]))

idToken = auth_out['AuthenticationResult']['IdToken']

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1/api/v1/customer/orders"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {idToken}",
    "User-Agent": "FreshMart-Batch-Order/1.0"
}

for i in range(5):
    order_payload = json.dumps({
        "items": [
            {
                "productId": f"PROD-00{i+1}",
                "productName": f"Batch Product {i+1}",
                "price": 4.99 + i,
                "quantity": 1
            }
        ],
        "deliveryAddress": {
            "fullName": f"Test Customer {i+1}",
            "street": "456 Orchard Rd",
            "city": "Singapore",
            "postalCode": "238877",
            "phone": "+6598765432"
        },
        "paymentMethod": "CREDIT_CARD",
        "deliveryMethod": "STANDARD"
    }).encode("utf-8")

    req = urllib.request.Request(base_url, data=order_payload, headers=headers)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode('utf-8')
            parsed = json.loads(body)
            order_id = parsed.get("orderId") or parsed.get("id") or "UNKNOWN"
            print(f"[{resp.status}] Order {i+1} Created successfully! Order ID: {order_id} ({(time.time()-t0)*1000:.1f}ms)")
    except Exception as e:
        print(f"Order {i+1} Failed: {e}")
    time.sleep(0.5)

print("Batch order placement complete.")
