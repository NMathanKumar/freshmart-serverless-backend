# Setup Node Environment Action (`setup-node-env`)

## Purpose

Initializes Node.js 22 environment with automated `npm` workspace dependency caching based on `package-lock.json` content hash.

## Inputs

| Input Name              | Required | Default               | Description                        |
| :---------------------- | :------- | :-------------------- | :--------------------------------- |
| `node-version`          | No       | `'22'`                | Node.js version to install         |
| `cache-dependency-path` | No       | `'package-lock.json'` | Path to lockfile for cache hashing |

## Outputs

| Output Name    | Description                       |
| :------------- | :-------------------------------- |
| `node-version` | Installed Node.js version string  |
| `status`       | Outcome status of Node setup step |

## Usage Example

```yaml
- uses: ./.github/actions/setup-node-env
  with:
    node-version: '22'
```
