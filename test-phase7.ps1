# Phase 7 End-to-End Test Script

$baseUrl = "http://localhost:3000/api"
$specId = "Swagger Petstore - OpenAPI 3.0-1.0.27"

Write-Host "=== Phase 7 Testing ===" -ForegroundColor Cyan

# Step 1: Create Environment
Write-Host ""
Write-Host "1. Creating Environment..." -ForegroundColor Yellow
$envBody = @{
    specId = $specId
    name = "test-env"
    baseUrl = "https://petstore3.swagger.io/api/v3"
    defaultHeaders = @{
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json -Depth 10

try {
    $env = Invoke-RestMethod -Uri "$baseUrl/environments" -Method POST -Body $envBody -ContentType "application/json"
    Write-Host "✓ Environment created: $($env.id)" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Plan Run
Write-Host ""
Write-Host "2. Planning Run..." -ForegroundColor Yellow
$planBody = @{
    specId = $specId
    envName = "test-env"
    selection = @{
        mode = "tag"
        tags = @("pet")
    }
} | ConvertTo-Json -Depth 10

try {
    $plan = Invoke-RestMethod -Uri "$baseUrl/execution/plan" -Method POST -Body $planBody -ContentType "application/json"
    Write-Host "✓ Run planned:" -ForegroundColor Green
    Write-Host "  RunId: $($plan.runId)" -ForegroundColor Gray
    Write-Host "  Operations: $($plan.operationCount)" -ForegroundColor Gray
    Write-Host "  Test Cases: $($plan.testCount)" -ForegroundColor Gray
    $runId = $plan.runId
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Get Run Status
Write-Host ""
Write-Host "3. Getting Run Status..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$baseUrl/execution/status/$runId" -Method GET
    Write-Host "✓ Run status retrieved:" -ForegroundColor Green
    Write-Host "  Status: $($status.status)" -ForegroundColor Gray
    Write-Host "  Steps: $($status.steps.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Phase 7 Tests Passed! ===" -ForegroundColor Green

