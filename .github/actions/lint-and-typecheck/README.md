# Lint & Typecheck Action (`lint-and-typecheck`)

## Purpose

Validates Prettier code formatting, ESLint rules, and TypeScript type safety across all monorepo workspaces (`apps/*`, `packages/*`, `services/*`).

## Inputs

None.

## Outputs

| Output Name | Description              |
| :---------- | :----------------------- |
| `status`    | Overall execution status |

## Usage Example

```yaml
- uses: ./.github/actions/lint-and-typecheck
```
