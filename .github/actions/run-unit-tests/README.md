# Run Unit & Integration Tests Action (`run-unit-tests`)

## Purpose

Runs unit tests, integration tests, API contract tests, and `c8` test coverage reports across microservices.

## Inputs

| Input Name         | Required | Default  | Description                      |
| :----------------- | :------- | :------- | :------------------------------- |
| `enforce-coverage` | No       | `'true'` | Flag to enforce minimum coverage |

## Outputs

| Output Name | Description           |
| :---------- | :-------------------- |
| `status`    | Test execution status |

## Usage Example

```yaml
- uses: ./.github/actions/run-unit-tests
  with:
    enforce-coverage: 'true'
```
