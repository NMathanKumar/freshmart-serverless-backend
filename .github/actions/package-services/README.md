# Package Lambda Microservices Action (`package-services`)

## Purpose

Compiles monorepo packages, packages 25+ Lambda microservice zips into `services/<service>/lambda.zip`, and generates `lambda-artifacts-manifest.json` containing SHA-256 digests.

## Inputs

None.

## Outputs

| Output Name     | Description                                                           |
| :-------------- | :-------------------------------------------------------------------- |
| `manifest-file` | Relative path to artifact manifest (`lambda-artifacts-manifest.json`) |
| `status`        | Execution status                                                      |

## Usage Example

```yaml
- uses: ./.github/actions/package-services
```
