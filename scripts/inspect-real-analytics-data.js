const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const region = 'ap-southeast-1';
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

async function run() {
  const [ordersRes, profilesRes] = await Promise.all([
    ddb.send(new ScanCommand({ TableName: 'freshmart-dev-orders' })),
    ddb.send(new ScanCommand({ TableName: 'freshmart-dev-user-profiles' })),
  ]);

  const orders = ordersRes.Items || [];
  const profiles = profilesRes.Items || [];

  console.log(`DDB User Profiles Count: ${profiles.length}`);
  console.log(`DDB Orders Count: ${orders.length}`);

  let totalRevenueAll = 0;
  let totalRevenuePaid = 0;
  let totalRevenueNonCancelled = 0;

  orders.forEach((o) => {
    const amt = Number(o.totalAmount) || 0;
    totalRevenueAll += amt;
    if (o.paymentStatus === 'SUCCESS') totalRevenuePaid += amt;
    if (o.orderStatus !== 'CANCELLED') totalRevenueNonCancelled += amt;
  });

  console.log(`Total Revenue (All orders): ₹${totalRevenueAll.toFixed(2)}`);
  console.log(`Total Revenue (Paid orders SUCCESS): ₹${totalRevenuePaid.toFixed(2)}`);
  console.log(`Total Revenue (Non-cancelled orders): ₹${totalRevenueNonCancelled.toFixed(2)}`);
  console.log(`Sample Order Amounts:`, orders.map(o => ({ id: o.orderId || o.id, amount: o.totalAmount, status: o.orderStatus, paymentStatus: o.paymentStatus })));
}

run().catch(console.error);
