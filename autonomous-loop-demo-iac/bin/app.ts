#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsStack } from '../lib/products-stack';

const app = new cdk.App();

new ProductsStack(app, 'ProductsStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
  description: 'Serverless Products API - Autonomous Loop IaC Demo',
  tags: {
    project: 'autonomous-loop-demo',
    demo: 'iac'
  }
});

app.synth();
