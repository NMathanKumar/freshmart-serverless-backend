#!/usr/bin/env pwsh
# ──────────────────────────────────────────────────────────────────────────────
# Deployment Event Publisher
# Publishes a custom CloudWatch metric and annotation when a deployment occurs.
# Run this as part of your CI/CD pipeline after terraform apply.
#
# Usage:
#   .\scripts\publish-deploy-event.ps1 -Environment prod -Service "all" -Commit "abc1234"
#   .\scripts\publish-deploy-event.ps1 -Environment prod -Service "payment" -Commit "abc1234" -Region ap-southeast-1
# ──────────────────────────────────────────────────────────────────────────────

param(
  [Parameter(Mandatory=$true)][string]$Environment,
  [Parameter(Mandatory=$true)][string]$Commit,
  [string]$Service = "platform",
  [string]$Region = "ap-southeast-1",
  [string]$BuildNumber = "unknown",
  [string]$DeployedBy = $env:USERNAME
)

$timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
$namespace = "FreshMart/$Environment/Deployments"

Write-Host "Publishing deployment event..." -ForegroundColor Cyan
Write-Host "  Environment : $Environment"
Write-Host "  Service     : $Service"
Write-Host "  Commit      : $Commit"
Write-Host "  Build       : $BuildNumber"
Write-Host "  Deployed by : $DeployedBy"
Write-Host "  Timestamp   : $timestamp"

# Publish custom CloudWatch metric — creates a deployment marker
aws cloudwatch put-metric-data `
  --namespace $namespace `
  --metric-name "DeploymentEvent" `
  --value 1 `
  --unit Count `
  --dimensions `
    "Name=Service,Value=$Service" `
    "Name=Environment,Value=$Environment" `
    "Name=CommitSha,Value=$($Commit.Substring(0, [Math]::Min(8, $Commit.Length)))" `
    "Name=DeployedBy,Value=$DeployedBy" `
  --region $Region

if ($LASTEXITCODE -eq 0) {
  Write-Host "`n✅ Deployment event published to CloudWatch." -ForegroundColor Green
  Write-Host "   Namespace : $namespace"
  Write-Host "   Metric    : DeploymentEvent"
  Write-Host ""
  Write-Host "To view in CloudWatch:" -ForegroundColor Yellow
  Write-Host "   Metrics → Custom Namespaces → $namespace → DeploymentEvent"
} else {
  Write-Host "`n❌ Failed to publish deployment event. Check AWS credentials." -ForegroundColor Red
  exit 1
}
