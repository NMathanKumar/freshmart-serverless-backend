import urllib.request
import json
import time
import subprocess

USER_POOL_ID = "ap-southeast-1_RXGKIq89c"
CLIENT_ID = "5qeg7to1eroscp415s5jqicvt2"
EMAIL = "nmathankumar020@gmail.com"
PASSWORD = "Password123!"

# Set password first
subprocess.check_output([
    'aws', 'cognito-idp', 'admin-set-user-password',
    '--user-pool-id', USER_POOL_ID,
    '--username', EMAIL,
    '--password', PASSWORD,
    '--permanent'
])

auth_out = json.loads(subprocess.check_output([
    'aws', 'cognito-idp', 'initiate-auth',
    '--auth-flow', 'USER_PASSWORD_AUTH',
    '--client-id', CLIENT_ID,
    '--auth-parameters', f'USERNAME={EMAIL},PASSWORD={PASSWORD}'
]))

idToken = auth_out['AuthenticationResult']['IdToken']

base_url = "https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1/api/v1/customer/orders"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {idToken}",
    "User-Agent": "FreshMart-CustomerEmail-Test/1.0"
}

order_payload = json.dumps({
    "customerEmail": EMAIL,
    "customerName": "Mathankumar N",
    "items": [
        {
            "productId": "PROD-100",
            "productName": "Fresh Organic Mangoes",
            "price": 5.99,
            "quantity": 2
        }
    ],
    "deliveryAddress": {
        "fullName": "Mathankumar N",
        "street": "100 Verified Identity Way",
        "city": "Singapore",
        "postalCode": "654321",
        "phone": "+6590000000"
    },
    "paymentMethod": "CREDIT_CARD",
    "deliveryMethod": "EXPRESS"
}).encode("utf-8")

req = urllib.request.Request(base_url, data=order_payload, headers=headers)
t0 = time.time()
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        parsed = json.loads(body)
        order_id = parsed.get("orderId") or parsed.get("id")
        print(f"[{resp.status}] Test Order Placed for {EMAIL}! Order ID: {order_id} ({(time.time()-t0)*1000:.1f}ms)")
except Exception as e:
    print(f"Order Placement Failed: {e}")
