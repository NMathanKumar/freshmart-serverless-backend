import re
import sys

def main():
    try:
        with open('scripts/seed-database.js', 'r') as f:
            code = f.read()
            
        # Revert everything to pk / sk first (safest baseline)
        code = code.replace('PK:', 'pk:')
        code = code.replace('SK:', 'sk:')
        code = code.replace('item.PK', 'item.pk')
        code = code.replace('item.SK', 'item.sk')
        
        # Now fix only products and auth tables to use PK / SK
        
        # clearTable logic
        code = code.replace(
            "else if (tableName === TABLES.products) Key = { pk: item.pk, sk: item.sk };",
            "else if (tableName === TABLES.products) Key = { PK: item.PK, SK: item.SK };"
        )
        code = code.replace(
            "else if (tableName === TABLES.auth) Key = { pk: item.pk, sk: item.sk };",
            "else if (tableName === TABLES.auth) Key = { PK: item.PK, SK: item.SK };"
        )
        
        # auth items logic
        code = code.replace("pk: `USER#${auth.id}`", "PK: `USER#${auth.id}`")
        code = code.replace("sk: `PROFILE#${auth.id}`", "SK: `PROFILE#${auth.id}`")
        code = code.replace("pk: `EMAIL#${auth.email}`", "PK: `EMAIL#${auth.email}`")
        code = code.replace("sk: `USER#${auth.id}`", "SK: `USER#${auth.id}`")
        
        # product items logic (META)
        code = code.replace("pk: `PRODUCT#${p.id}`,\n      sk: 'META'", "PK: `PRODUCT#${p.id}`,\n      SK: 'META'")
        # product items logic (LIST)
        code = code.replace("pk: `PRODUCT#${p.id}`,\n      sk: 'LIST'", "PK: `PRODUCT#${p.id}`,\n      SK: 'LIST'")
        
        with open('scripts/seed-database.js', 'w') as f:
            f.write(code)
            
        print("Successfully fixed seed script")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
