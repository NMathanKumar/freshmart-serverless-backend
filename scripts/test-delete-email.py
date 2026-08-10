import boto3
import json

client = boto3.client('lambda', region_name='ap-southeast-1')

# Test DELETE with customerId = 'thozhan11@gmail.com'
event1 = {
    "version": "2.0",
    "routeKey": "DELETE /v1/admin/customers/{customerId}",
    "rawPath": "/v1/admin/customers/thozhan11@gmail.com",
    "headers": {"authorization": "Bearer dummy-token"},
    "pathParameters": {"customerId": "thozhan11@gmail.com"},
    "requestContext": {
        "authorizer": {
            "jwt": {
                "claims": {"sub": "test-admin", "cognito:groups": ["admins"]}
            }
        },
        "http": {"method": "DELETE", "path": "/v1/admin/customers/thozhan11@gmail.com"}
    }
}

res1 = client.invoke(FunctionName='freshmart-dev-user-service', InvocationType='RequestResponse', Payload=json.dumps(event1))
print("Test 1 (thozhan11@gmail.com):", res1['Payload'].read().decode('utf-8'))

# Test DELETE with customerId = 'CUST-thoz'
event2 = {
    "version": "2.0",
    "routeKey": "DELETE /v1/admin/customers/{customerId}",
    "rawPath": "/v1/admin/customers/CUST-thoz",
    "headers": {"authorization": "Bearer dummy-token"},
    "pathParameters": {"customerId": "CUST-thoz"},
    "requestContext": {
        "authorizer": {
            "jwt": {
                "claims": {"sub": "test-admin", "cognito:groups": ["admins"]}
            }
        },
        "http": {"method": "DELETE", "path": "/v1/admin/customers/CUST-thoz"}
    }
}

res2 = client.invoke(FunctionName='freshmart-dev-user-service', InvocationType='RequestResponse', Payload=json.dumps(event2))
print("Test 2 (CUST-thoz):", res2['Payload'].read().decode('utf-8'))
