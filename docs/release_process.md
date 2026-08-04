# Release Process

1. Create a PR to `main`.
2. CI runs tests and typechecking.
3. Merge PR to `main`.
4. CD pipeline automatically deploys to Dev/Staging.
5. Tag the release (`v1.0.0`) to trigger the Release workflow and bundle artifacts.