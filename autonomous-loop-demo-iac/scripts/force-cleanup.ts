import { CloudFormationClient, DeleteStackCommand, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

const STACK_NAME = 'ProductsStack';

async function forceCleanup(): Promise<void> {
  console.log('🧹 Force Cleanup: Attempting to delete stack...\n');

  const client = new CloudFormationClient({});

  try {
    // Check if stack exists
    const describeCommand = new DescribeStacksCommand({ StackName: STACK_NAME });
    await client.send(describeCommand);

    console.log(`Found stack: ${STACK_NAME}`);
    console.log('Initiating deletion...\n');

    // Delete stack
    const deleteCommand = new DeleteStackCommand({ StackName: STACK_NAME });
    await client.send(deleteCommand);

    console.log('✅ Stack deletion initiated');
    console.log('   This may take 2-3 minutes to complete.');
    console.log(`   Monitor progress: aws cloudformation describe-stacks --stack-name ${STACK_NAME}\n`);

    process.exit(0);
  } catch (error: any) {
    if (error.name === 'ValidationError' && error.message.includes('does not exist')) {
      console.log('✅ Stack does not exist. No cleanup needed.\n');
      process.exit(0);
    } else {
      console.error('❌ Failed to delete stack:', error.message);
      console.error('\nManual cleanup required:');
      console.error(`   aws cloudformation delete-stack --stack-name ${STACK_NAME}\n`);
      process.exit(1);
    }
  }
}

forceCleanup();
