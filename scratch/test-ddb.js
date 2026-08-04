const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function run() {
  const item = {
    productId: `prod_${Date.now()}`,
    productName: 'Fresh Organic Apples',
    category: 'Fresh Produce',
    price: 149.0,
    stock: 60,
    available: true,
    sku: 'SKU-[#04883B]',
    description: 'Crisp, sweet organic apples from local orchards.',
    images: ['https://freshmart-dev-assets-769044546162.s3.ap-southeast-1.amazonaws.com/catalog/products/product_avocado_sample.png'],
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: 'freshmart-dev-products',
    Item: item,
  }));

  const result = await docClient.send(new ScanCommand({
    TableName: 'freshmart-dev-products',
  }));

  console.log('FRESHMART-DEV-PRODUCTS SCAN RESULT:', JSON.stringify(result.Items, null, 2));
}

run().catch(console.error);
