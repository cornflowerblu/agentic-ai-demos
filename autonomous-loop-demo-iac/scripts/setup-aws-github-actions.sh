#!/bin/bash
# Setup AWS OIDC and IAM role for GitHub Actions CDK deployment
# This script was used to configure AWS credentials for CI/CD

set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO_OWNER="cornflowerblu"
REPO_NAME="agentic-ai-demos"

echo "📋 Setting up AWS for GitHub Actions..."
echo "   Account: $ACCOUNT_ID"
echo "   Repository: $REPO_OWNER/$REPO_NAME"
echo ""

# Step 1: Create OIDC provider for GitHub Actions (if not exists)
echo "1️⃣  Creating GitHub OIDC provider..."
if aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')].Arn" --output text | grep -q "token.actions.githubusercontent.com"; then
  echo "   ✅ OIDC provider already exists"
else
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 1c58a3a8518e8759bf075b76b750d4f2df264fcd \
    --output text > /dev/null
  echo "   ✅ OIDC provider created"
fi

# Step 2: Create trust policy
echo "2️⃣  Creating trust policy..."
cat > /tmp/github-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${REPO_OWNER}/${REPO_NAME}:*"
        }
      }
    }
  ]
}
EOF
echo "   ✅ Trust policy created"

# Step 3: Create IAM role
echo "3️⃣  Creating IAM role..."
if aws iam get-role --role-name GitHubActionsCDKDemoRole &>/dev/null; then
  echo "   ✅ Role already exists"
  ROLE_ARN=$(aws iam get-role --role-name GitHubActionsCDKDemoRole --query 'Role.Arn' --output text)
else
  ROLE_ARN=$(aws iam create-role \
    --role-name GitHubActionsCDKDemoRole \
    --assume-role-policy-document file:///tmp/github-trust-policy.json \
    --description "Role for GitHub Actions to deploy CDK stacks in demos" \
    --query 'Role.Arn' \
    --output text)
  echo "   ✅ Role created: $ROLE_ARN"
fi

# Step 4: Attach AdministratorAccess policy
echo "4️⃣  Attaching permissions..."
aws iam attach-role-policy \
  --role-name GitHubActionsCDKDemoRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess 2>/dev/null || true
echo "   ✅ AdministratorAccess policy attached"

# Step 5: Set GitHub secret
echo "5️⃣  Configuring GitHub secret..."
gh secret set AWS_DEMO_ROLE_ARN --body "$ROLE_ARN"
echo "   ✅ GitHub secret AWS_DEMO_ROLE_ARN configured"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To trigger a full deployment workflow:"
echo "   git commit -m 'your message [deploy-to-aws]'"
echo "   git push"
echo ""
echo "The workflow will:"
echo "   1. Run unit tests (CDK assertions)"
echo "   2. Deploy CDK stack to AWS"
echo "   3. Run integration tests against live API"
echo "   4. Destroy the stack (cleanup)"
echo ""
echo "Estimated cost: ~\$0.50 per run"
