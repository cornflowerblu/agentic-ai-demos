import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export class ProductsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table for Products
    const table = new dynamodb.Table(this, 'ProductsTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Allow deletion for demo
      tableName: `products-${this.stackName}`
    });
    cdk.Tags.of(table).add('demo', 'autonomous-loop-iac');
    cdk.Tags.of(table).add('managedBy', 'cdk');

    // Lambda Function for Products API
    const handler = new lambda.Function(this, 'ProductsApiHandler', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda'), {
        bundling: {
          image: lambda.Runtime.NODEJS_24_X.bundlingImage,
          command: [
            'bash', '-c',
            'cp -r /asset-input/* /asset-output/ && cd /asset-output && npm install --production --cache /tmp/.npm --prefer-offline'
          ],
          user: 'root'
        }
      }),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
        NODE_OPTIONS: '--enable-source-maps'
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: 'Products API Handler - Autonomous Loop Demo'
    });
    cdk.Tags.of(handler).add('demo', 'autonomous-loop-iac');

    // Grant Lambda permissions to read/write DynamoDB
    table.grantReadWriteData(handler);

    // API Gateway REST API
    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products Service',
      description: 'Serverless Products API - Autonomous Loop Demo',
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: false, // Keep costs minimal
        metricsEnabled: false  // Keep costs minimal
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization']
      }
    });
    cdk.Tags.of(api).add('demo', 'autonomous-loop-iac');

    // Lambda integration
    const integration = new apigateway.LambdaIntegration(handler, {
      proxy: true
    });

    // Routes
    const products = api.root.addResource('products');
    products.addMethod('GET', integration);     // GET /products
    products.addMethod('POST', integration);    // POST /products

    const product = products.addResource('{id}');
    product.addMethod('GET', integration);      // GET /products/{id}
    product.addMethod('PUT', integration);      // PUT /products/{id}
    product.addMethod('DELETE', integration);   // DELETE /products/{id}

    // Stack Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'Products API URL',
      exportName: `${this.stackName}-ApiUrl`
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: table.tableName,
      description: 'DynamoDB Table Name',
      exportName: `${this.stackName}-TableName`
    });

    new cdk.CfnOutput(this, 'LambdaArn', {
      value: handler.functionArn,
      description: 'Lambda Function ARN'
    });
  }
}
