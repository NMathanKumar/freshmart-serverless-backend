const fs = require('fs');

const planFile = process.argv[2] || 'tfplan.json';

if (!fs.existsSync(planFile)) {
  console.log(`Plan file ${planFile} not found. Skipping destroy check.`);
  process.exit(0);
}

try {
  let fileContent = fs.readFileSync(planFile, 'utf8');
  fileContent = fileContent.replace(/^\uFEFF/, '');
  const planData = JSON.parse(fileContent);
  const resourceChanges = planData.resource_changes || [];

  const dangerousTypes = [
    'aws_dynamodb_table',
    'aws_cognito_user_pool',
    'aws_cloudfront_distribution',
    'aws_s3_bucket',
    'aws_sqs_queue',
    'aws_sns_topic',
    'aws_iam_role'
  ];

  let dangerousDestroys = [];

  for (const change of resourceChanges) {
    const actions = change.change?.actions || [];
    const isDestroying = actions.includes('delete') || actions.includes('destroy');
    if (isDestroying && dangerousTypes.includes(change.type)) {
      dangerousDestroys.push({
        address: change.address,
        type: change.type,
        actions: actions
      });
    }
  }

  if (dangerousDestroys.length > 0) {
    console.error('❌ DANGEROUS DESTROY DETECTED IN TERRAFORM PLAN:');
    console.error(JSON.stringify(dangerousDestroys, null, 2));
    if (process.env.ALLOW_DANGEROUS_DESTROY !== 'true') {
      console.error('Pipeline failed to prevent accidental deletion of critical infrastructure.');
      process.exit(1);
    } else {
      console.warn('⚠️ Override flag ALLOW_DANGEROUS_DESTROY is set to true. Proceeding despite destroy risk.');
    }
  } else {
    console.log('✅ Terraform Plan Destroy Guard: No dangerous resource deletions detected.');
  }
} catch (err) {
  console.error('Failed to parse Terraform plan JSON:', err.message);
  process.exit(1);
}
