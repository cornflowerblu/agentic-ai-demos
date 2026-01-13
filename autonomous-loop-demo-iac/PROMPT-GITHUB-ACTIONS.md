# Task: Fix GitHub Actions Workflow for Autonomous CDK Deployment

## Objective

Get the GitHub Actions workflow (`.github/workflows/cdk-autonomous-deployment.yml`) to run successfully in CI/CD. The workflow should execute all phases (unit tests → deploy → integration tests → cleanup) and pass completely.

## Current State

- ✅ CDK infrastructure is complete and tested locally
- ✅ Lambda implementation passes all 15 integration tests locally
- ✅ Local deployment/destroy cycle works perfectly
- ❌ GitHub Actions workflow exists but hasn't been tested
- ❌ May have authentication issues, syntax errors, or missing configuration

## Acceptance Criteria

The GitHub Actions workflow must:

1. **Trigger successfully** - Workflow can be triggered via push or manual dispatch
2. **Unit tests pass** - All CDK assertion tests pass in CI
3. **AWS authentication works** - Can authenticate to AWS (if `deploy_to_aws=true`)
4. **Deployment succeeds** - CDK stack deploys to AWS (if `deploy_to_aws=true`)
5. **Integration tests pass** - All 15 tests pass against live AWS (if deployed)
6. **Cleanup succeeds** - Stack destroyed successfully (if deployed)
7. **Workflow completes** - No failed steps, green checkmark in GitHub Actions

## Workflow File

Location: `.github/workflows/cdk-autonomous-deployment.yml`

The workflow supports two modes:
- **Dry run** (`deploy_to_aws=false`): Only runs unit tests
- **Full deployment** (`deploy_to_aws=true`): Runs all phases including AWS deployment

## Implementation Steps

### Step 1: Push to GitHub

```bash
git add -A
git commit -m "feat: add GitHub Actions workflow for autonomous CDK deployment"
git push origin demo-test-02
```

### Step 2: Trigger Workflow

Use GitHub CLI to trigger the workflow:

```bash
# Option 1: Dry run (unit tests only, no AWS)
gh workflow run cdk-autonomous-deployment.yml -f deploy_to_aws=false

# Option 2: Full deployment (requires AWS credentials configured in GitHub)
gh workflow run cdk-autonomous-deployment.yml -f deploy_to_aws=true
```

### Step 3: Check Workflow Status

```bash
# List recent workflow runs
gh run list --workflow=cdk-autonomous-deployment.yml --limit 5

# Get the latest run ID
LATEST_RUN=$(gh run list --workflow=cdk-autonomous-deployment.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Watch the workflow run
gh run watch $LATEST_RUN

# View detailed logs if failed
gh run view $LATEST_RUN --log
```

### Step 4: Debug and Fix

If the workflow fails:

1. Read the error logs: `gh run view $LATEST_RUN --log`
2. Identify the failing step
3. Fix the issue in `.github/workflows/cdk-autonomous-deployment.yml`
4. Commit and push the fix
5. Re-trigger the workflow
6. Repeat until successful

## Common Issues & Solutions

### Issue: Workflow syntax errors
**Solution**: Validate YAML syntax, check indentation, verify action versions exist

### Issue: AWS authentication fails
**Symptom**: "Unable to locate credentials"
**Solution**:
- Check if `AWS_DEMO_ROLE_ARN` secret is configured in GitHub
- Verify OIDC provider is set up in AWS account
- For dry run mode, ensure AWS steps are properly skipped with `if: inputs.deploy_to_aws`

### Issue: CDK bootstrap not found
**Symptom**: "Has the environment been bootstrapped?"
**Solution**: Add bootstrap step before deployment

### Issue: Node.js version mismatch
**Symptom**: Module compatibility errors
**Solution**: Ensure `actions/setup-node@v4` uses `node-version: '24.x'`

### Issue: Missing dependencies
**Symptom**: "Cannot find module"
**Solution**: Ensure `npm ci` runs before any npm commands

### Issue: Cleanup doesn't run on failure
**Symptom**: Resources left in AWS after failed workflow
**Solution**: Ensure destroy step uses `if: inputs.deploy_to_aws && always()`

### Issue: Working directory not set
**Symptom**: "package.json not found"
**Solution**: All steps need `working-directory: autonomous-loop-demo-iac` (but we're already in that directory, so this shouldn't be needed)

## Verification Commands

```bash
# Check if workflow file is valid
gh workflow view cdk-autonomous-deployment.yml

# List all workflows in repo
gh workflow list

# View latest run status
gh run list --workflow=cdk-autonomous-deployment.yml --limit 1

# View run in browser
gh run view --web
```

## Success Criteria

The workflow run is considered successful when:

- ✅ Workflow triggers without errors
- ✅ All steps complete (no red X marks)
- ✅ Unit tests: 14/14 pass
- ✅ If `deploy_to_aws=true`:
  - ✅ CDK bootstrap succeeds (or already bootstrapped)
  - ✅ Stack deploys successfully
  - ✅ Integration tests: 15/15 pass
  - ✅ Stack destroys successfully
- ✅ Workflow shows green checkmark in GitHub Actions UI
- ✅ No failed steps in workflow summary

## Completion Signal

When the workflow runs successfully from start to finish with all steps passing, output:

```
<promise>COMPLETE</promise>
```

## Cost Considerations

- Dry run mode: $0 (no AWS resources, only GitHub Actions minutes)
- Full deployment mode: ~$0.50 per run (same as local)
- GitHub Actions minutes: Free tier (2000 minutes/month for public repos)

## Notes

- This task tests CI/CD automation, not just local development
- GitHub Actions is a different environment (Ubuntu, different permissions, secrets management)
- The workflow must be idempotent (can run multiple times safely)
- Cleanup must be guaranteed even on failure (cost control)
- This demonstrates autonomous debugging of infrastructure automation

## Expected Iterations

1-3 iterations expected to fix initial issues:
- Iteration 1: Push initial workflow, likely fails (authentication, syntax, or config)
- Iteration 2: Fix identified issues, re-trigger
- Iteration 3: Fine-tune any remaining edge cases
- Completion: Workflow passes all checks

Good luck! 🚀
