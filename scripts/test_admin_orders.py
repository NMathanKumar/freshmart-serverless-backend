import urllib.request
import json
import time
import subprocess

USER_POOL_ID = "ap-southeast-1_RXGKIq89c"
CLIENT_ID = "5qeg7to1eroscp415s5jqicvt2"
EMAIL = "nmadhankumar597@gmail.com"
PASSWORD = "Password123!"

auth_out = json.loads(subprocess.check_output([
    'aws', 'cognito-idp', 'initiate-auth',
    '--auth-flow', 'USER_PASSWORD_AUTH',
    '--client-id', CLIENT_ID,
    '--auth-parameters', f'USERNAME={EMAIL},PASSWORD={PASSWORD}'
]))

idToken = auth_out['AuthenticationResult']['IdToken']

routes = [
    '/v1/orders/admin/all',
    '/orders/admin/all',
    '/v1/admin/orders',
    '/api/v1/orders/admin/all'
]

headers = {
    "Authorization": f"Bearer {idToken}",
    "User-Agent": "FreshMart-Admin-Test/1.0"
}

print("Testing Authenticated Admin Orders Routes...")
for r in routes:
    url = f"https://98fyk75ya9.execute-api.ap-southeast-1.amazonaws.com/v1{r}"
    req = urllib.request.Request(url, headers=headers)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode('utf-8')
            print(f"[{resp.status}] GET {r} Succeeded! ({(time.time()-t0)*1000:.1f}ms) Payload len: {len(body)}")
    except Exception as e:
        print(f"GET {r} Failed: {e}")
