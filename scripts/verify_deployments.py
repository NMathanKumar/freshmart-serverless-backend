import subprocess
import json

funcs = [
    'freshmart-dev-product-service',
    'freshmart-dev-customer-bff-service',
    'freshmart-dev-notification-service',
    'freshmart-dev-cart-service',
    'freshmart-dev-order-service',
    'freshmart-dev-user-service'
]

print('| Lambda Function | Last Modified | Code Size (Bytes) | CodeSha256 | Handler | Runtime |')
print('| :--- | :--- | ---: | :--- | :--- | :--- |')

for fn in funcs:
    out = json.loads(subprocess.check_output(['aws', 'lambda', 'get-function', '--function-name', fn]))
    cfg = out['Configuration']
    sha = cfg['CodeSha256'][:12] + '...'
    print(f"| `{fn}` | {cfg['LastModified']} | {cfg['CodeSize']} | `{sha}` | `{cfg['Handler']}` | {cfg['Runtime']} |")
