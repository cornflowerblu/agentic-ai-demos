import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

async function checkAwsCredentials(): Promise<void> {
  console.log('🔍 Pre-Flight Check: Validating AWS credentials...\n');

  try {
    const client = new STSClient({});
    const command = new GetCallerIdentityCommand({});
    const response = await client.send(command);

    console.log('✅ AWS credentials valid');
    console.log(`   Account: ${response.Account}`);
    console.log(`   User/Role: ${response.Arn}`);

    const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
    console.log(`   Region: ${region}\n`);

    console.log('💰 Cost Estimate for Complete Run:');
    console.log('   - DynamoDB (on-demand): ~$0.10');
    console.log('   - Lambda invocations: Free tier');
    console.log('   - API Gateway requests: Free tier');
    console.log('   - TOTAL: <$0.50 (mostly free tier)\n');

    console.log('⚠️  IMPORTANT: Always run "npm run destroy" after completion!');
    console.log('   Leaving resources deployed may incur ongoing costs.\n');

    console.log('✅ Pre-flight check passed. Ready to proceed.\n');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ AWS credentials not configured or invalid\n');
    console.error('Please configure AWS credentials before proceeding:\n');
    console.error('  Option 1: AWS CLI');
    console.error('    aws configure\n');
    console.error('  Option 2: Environment variables');
    console.error('    export AWS_ACCESS_KEY_ID=...');
    console.error('    export AWS_SECRET_ACCESS_KEY=...');
    console.error('    export AWS_REGION=us-east-1\n');
    console.error(`Error details: ${error.message}\n`);
    process.exit(1);
  }
}

checkAwsCredentials();
