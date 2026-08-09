# Terraform Dangerous Destroy Guard Action (`check-destroy-guard`)

## Purpose

Parses Terraform plan output JSON and halts execution if stateful resources (DynamoDB, Cognito, CloudFront, S3, SQS, SNS) are slated for unintended destruction.

## Inputs

| Input Name       | Required | Default         | Description                                |
| :--------------- | :------- | :-------------- | :----------------------------------------- |
| `plan-json-path` | No       | `'tfplan.json'` | Path to generated terraform plan JSON file |

## Outputs

| Output Name | Description         |
| :---------- | :------------------ |
| `status`    | Guard check outcome |

## Usage Example

```yaml
- uses: ./.github/actions/check-destroy-guard
  with:
    plan-json-path: 'tfplan.json'
```
