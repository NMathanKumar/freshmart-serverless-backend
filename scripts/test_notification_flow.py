import urllib.request
import json
import time

token = "eyJraWQiOiIyaUtRQkJxTnA0MkF1MTc5MzRmNWQ5WEhVbElLT2RpanZUNFVVK2tKT2t3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiOWZhNDUwYy00MDAxLTcwZGUtNTg0Ni03Y2I5NDAyYmVjNTgiLCJjb2duaXRvOmdyb3VwcyI6WyJjdXN0b21lcnMiXSwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tL2FwLXNvdXRoZWFzdC0xX1JYR0tJcTg5YyIsImNsaWVudF9pZCI6IjVxZWc3dG8xZXJvc2NwNDE1czVqcWljdnQyIiwib3JpZGluX2p0aSI6ImUxM2ViMjI0LWQwNWMtNDYwOS1iMzdjLTc1OTM5YmU4MGZhYyIsImV2ZW50X2lkIjoiYWYzYTY5ODktZjhmNy00MTEwLTk2NGYtZTFlNmUwYWZhY2ViIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc4NjI2NTgzNCwiZXhwIjoxNzg2MjY5NDM0LCJpYXQiOjE3ODYyNjU4MzQsImp0aSI6ImYyZDg1MWU2LTUzYzMtNGI1Mi05YzJjLWY3ZDcwM2ZkNjc2NyIsInVzZXJuYW1lIjoiYjlmYTQ1MGMtNDAwMS03MGRlLTU4NDYtN2NiOTQwMmJlYzU4In0.JNkxKS8NoLX0xyM5VoS-cM-j3TBu_sdkRlvUAeaa8uGiP64qUOhgjER0NGID4i4ODaTfLhn4xFEKkFbPSQOZ48jbKkWzTUHO9t7l-POT1PL1lezWQBOcojN9fVvHBYjsqCVnSjXl7h0T6W4DbNb3QfQaow5sptfBEw7zagxfeoocwkrChZ14NgdT8g0KY1FVfE0u2c0SHVenn192oNl9M6izDTauNeTOHmdmSJ9xYwJq3u_fW7ha27IH3OL7lfK-kN7P1aVRcpJJtnt1b5m1NS2CtD2FWcebNpjq1JzTF62UD8fVwyamY9IMKDP9mWtAojFcTDl3DZpQCPtT7WKnBw"

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1"

order_payload = json.dumps({
    "items": [
        {
            "productId": "PROD-001",
            "productName": "Organic Fresh Bananas",
            "price": 2.99,
            "quantity": 2
        }
    ],
    "shippingAddress": {
        "fullName": "Test Customer",
        "street": "123 Fresh St",
        "city": "Singapore",
        "postalCode": "123456",
        "phone": "+6591234567"
    },
    "paymentMethod": "CREDIT_CARD",
    "deliveryMethod": "STANDARD"
}).encode("utf-8")

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {token}",
    "User-Agent": "FreshMart-Notification-Test/1.0"
}

print("=== PLACING TEST ORDER TO TRIGGER NOTIFICATION EVENT ===")
req = urllib.request.Request(f"{base_url}/customer/orders", data=order_payload, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print(f"[{resp.status}] Order Creation Success!")
        print(f"Response Payload: {body[:300]}")
except Exception as e:
    print(f"Order Placement Result: {e}")
    # Try alternative endpoint /api/v1/customer/orders
    req2 = urllib.request.Request(f"{base_url}/api/v1/customer/orders", data=order_payload, headers=headers)
    try:
        with urllib.request.urlopen(req2, timeout=10) as resp:
            body = resp.read().decode('utf-8')
            print(f"[{resp.status}] Order Creation Success via /api/v1/customer/orders!")
            print(f"Response Payload: {body[:300]}")
    except Exception as e2:
        print(f"Alternative Order Placement Result: {e2}")
