param(
  [Parameter(Mandatory=$true)][string]$Environment,
  [Parameter(Mandatory=$false)][string]$Token = "mock-token",
  [switch]$SkipPlan = $false
)

$ErrorActionPreference = "Continue"
$envDir = "terraform/environments/$Environment"
$exitCode = 0
$results = @()

function Add-Result($name, $passed, $detail = "") {
  $icon = if ($passed) { "SUCCESS" } else { "FAILED" }
  $results += [PSCustomObject]@{ Check = $name; Status = $icon; Detail = $detail }
  if (-not $passed) { $script:exitCode = 1 }
}

Write-Host "==============================================="
Write-Host " FreshMart Terraform Quality Gate - $Environment"
Write-Host "==============================================="

Write-Host "1/4 Checking terraform fmt..."
$fmtResult = terraform fmt -check -recursive terraform/ 2>&1
$fmtPassed = $LASTEXITCODE -eq 0
if (-not $fmtPassed) {
  Add-Result "terraform fmt" $false "Unformatted files found"
} else {
  Add-Result "terraform fmt" $true "All files formatted"
}

Write-Host "2/4 Validating configuration..."
Push-Location $envDir
$validateOutput = terraform validate 2>&1
$validatePassed = $LASTEXITCODE -eq 0
Add-Result "terraform validate" $validatePassed "Configuration validation"

if (-not $SkipPlan) {
  Write-Host "3/4 Running terraform plan..."
  $planOutput = terraform plan -var="internal_service_token=$Token" -out tfplan.ci 2>&1
  $planPassed = $LASTEXITCODE -eq 0
  
  if ($planPassed) {
    Add-Result "terraform plan" $true "Plan generated successfully"
    
    Write-Host "4/4 Checking destroy safety..."
    $planJsonRaw = terraform show -json tfplan.ci | Out-String
    $planJson = $planJsonRaw | ConvertFrom-Json
    $destroys = @($planJson.resource_changes | Where-Object { $_.change.actions -contains "delete" })
    
    $dangerousTypes = @(
      "aws_lambda_function", "aws_apigatewayv2_api", "aws_dynamodb_table",
      "aws_cloudfront_distribution", "aws_cognito_user_pool", "aws_sqs_queue",
      "aws_sns_topic", "aws_iam_role", "aws_iam_policy",
      "aws_s3_bucket", "aws_cloudwatch_event_bus"
    )
    
    $dangerous = @($destroys | Where-Object { $dangerousTypes -contains $_.type })
    
    if ($dangerous.Count -gt 0) {
      Add-Result "destroy safety" $false "$($dangerous.Count) dangerous destroys found"
    } else {
      Add-Result "destroy safety" $true "$($destroys.Count) total destroys, 0 dangerous"
    }
  } else {
    Add-Result "terraform plan" $false "Plan failed"
    Add-Result "destroy safety" $false "Skipped"
  }

} else {
  Add-Result "terraform plan" $true "Skipped"
  Add-Result "destroy safety" $true "Skipped"
}

Pop-Location

Write-Host "==============================================="
Write-Host " Quality Gate Results"
Write-Host "==============================================="
$results | Format-Table -AutoSize

if ($exitCode -eq 0) {
  Write-Host "ALL CHECKS PASSED. Safe to deploy."
} else {
  Write-Host "QUALITY GATE FAILED."
}

exit $exitCode
