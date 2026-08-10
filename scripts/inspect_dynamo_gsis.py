import boto3
import json

dynamodb = boto3.client('dynamodb', region_name='ap-southeast-1')

tables = [
    'freshmart-dev-products',
    'freshmart-dev-inventory',
    'freshmart-dev-orders',
    'freshmart-dev-user-profiles'
]

print("=== DYNAMODB TABLE & GSI STRUCTURE ===")
for t in tables:
    try:
        desc = dynamodb.describe_table(TableName=t)['Table']
        print(f"\nTable: {t}")
        print(f"  KeySchema: {desc.get('KeySchema')}")
        gsis = desc.get('GlobalSecondaryIndexes', [])
        if gsis:
            print("  GSIs:")
            for gsi in gsis:
                print(f"    - {gsi['IndexName']}: KeySchema={gsi['KeySchema']}, Status={gsi['IndexStatus']}")
        else:
            print("  GSIs: None")
    except Exception as e:
        print(f"\nTable {t} Error: {e}")
