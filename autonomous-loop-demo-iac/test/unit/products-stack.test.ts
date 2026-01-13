import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { ProductsStack } from '../../lib/products-stack';

describe('ProductsStack Unit Tests (CDK Assertions)', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new ProductsStack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' }
    });
    template = Template.fromStack(stack);
  });

  describe('DynamoDB Table', () => {
    it('should create exactly one DynamoDB table', () => {
      template.resourceCountIs('AWS::DynamoDB::Table', 1);
    });

    it('should have correct partition key configuration', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ]
      });
    });

    it('should use pay-per-request billing', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST'
      });
    });

    it('should have proper tagging', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        Tags: Match.arrayWith([
          { Key: 'demo', Value: 'autonomous-loop-iac' }
        ])
      });
    });
  });

  describe('Lambda Function', () => {
    it('should create exactly one Lambda function', () => {
      template.resourceCountIs('AWS::Lambda::Function', 1);
    });

    it('should use Node.js 24.x runtime', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs24.x'
      });
    });

    it('should have DynamoDB table name in environment', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            DYNAMODB_TABLE_NAME: Match.anyValue()
          }
        }
      });
    });

    it('should have appropriate timeout and memory settings', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Timeout: 10,
        MemorySize: 256
      });
    });
  });

  describe('API Gateway', () => {
    it('should create REST API', () => {
      template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    it('should have deployment stage configured', () => {
      // CDK creates a separate Stage resource, not a StageName on Deployment
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        StageName: 'prod'
      });
    });
  });

  describe('IAM Permissions', () => {
    it('should grant Lambda permissions to access DynamoDB', () => {
      // grantReadWriteData includes the core CRUD permissions we need
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'dynamodb:GetItem',
                'dynamodb:Scan',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem'
              ]),
              Effect: 'Allow',
              Resource: Match.anyValue()
            })
          ])
        }
      });
    });
  });

  describe('Stack Outputs', () => {
    it('should output API URL', () => {
      template.hasOutput('ApiUrl', {
        Description: 'Products API URL'
      });
    });

    it('should output DynamoDB table name', () => {
      template.hasOutput('TableName', {
        Description: 'DynamoDB Table Name'
      });
    });

    it('should output Lambda ARN', () => {
      template.hasOutput('LambdaArn', {
        Description: 'Lambda Function ARN'
      });
    });
  });
});
