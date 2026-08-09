# Verify Post-Deployment Health Action (`verify-health`)

## Purpose

Runs post-deployment validation scripts (`verify-web.js` and `smoke-deployment.js`) against live environment endpoints to confirm application health post-deploy.

## Inputs

None.

## Outputs

| Output Name | Description        |
| :---------- | :----------------- |
| `status`    | Smoke test outcome |

## Usage Example

```yaml
- uses: ./.github/actions/verify-health
```
