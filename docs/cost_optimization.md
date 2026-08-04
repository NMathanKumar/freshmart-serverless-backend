# Cost Optimization Recommendations

## AWS Academy Account Notice
Avoid implementing features that incur unnecessary costs (e.g., X-Ray, advanced AWS Budgets) unless strictly required.

## Recommendations
1. **Lambda Memory Tuning**: Analyze execution duration vs. memory to find the sweet spot (e.g., 512MB often balances speed and cost).
2. **Timeout Tuning**: Keep API lambdas to 10-15s max to prevent runaways.
3. **CloudFront Caching**: Maximize cache hit rates for static assets with immutable headers.
4. **DynamoDB Capacity**: Use On-Demand for unpredictable spikes, or Provisioned with Auto-Scaling if traffic is stable.
5. **S3 Lifecycle Policies**: Transition access logs and old deployment artifacts to Glacier or delete after 90 days.