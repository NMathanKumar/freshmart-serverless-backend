# Security Scan & Dependency Audit Action (`security-scan`)

## Purpose

Runs `npm audit` vulnerability checks against third-party Node modules and executes secret scanning against pull request commits.

## Inputs

None.

## Outputs

| Output Name | Description          |
| :---------- | :------------------- |
| `status`    | Security scan status |

## Usage Example

```yaml
- uses: ./.github/actions/security-scan
```
