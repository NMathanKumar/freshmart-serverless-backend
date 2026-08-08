# Setup Terraform Environment Action (`setup-terraform-env`)

## Purpose

Installs and configures HashiCorp Terraform CLI runner environment.

## Inputs

| Input Name          | Required | Default   | Description           |
| :------------------ | :------- | :-------- | :-------------------- |
| `terraform-version` | No       | `'1.9.0'` | Terraform CLI version |

## Outputs

| Output Name         | Description                  |
| :------------------ | :--------------------------- |
| `terraform-version` | Configured Terraform version |
| `status`            | Execution status             |

## Usage Example

```yaml
- uses: ./.github/actions/setup-terraform-env
  with:
    terraform-version: '1.9.0'
```
