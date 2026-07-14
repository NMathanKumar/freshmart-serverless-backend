# Rollback Checklist

If a release needs to be rolled back:

1. Identify the last known good Terraform state and packaged artifact set.
2. Confirm the failing change is limited to the current release.
3. Rebuild or restore the previous `lambda.zip` artifacts.
4. Reapply the prior Terraform plan or revert the intended configuration change.
5. Verify Lambda startup, health endpoints, and key event flows after rollback.
6. Confirm logs, alarms, and queues are stable before resuming traffic.

## Rollback Boundaries

- Do not change business logic during rollback.
- Do not introduce temporary compatibility shims.
- Do not alter environment schemas or resource naming.
