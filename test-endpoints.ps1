# Test script for Phase 5 and Phase 6 API endpoints

$baseUrl = "http://localhost:3000/api"

Write-Host "=== Testing Phase 5 & 6 Endpoints ===" -ForegroundColor Cyan

# Test 1: Health check
Write-Host ""
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -UseBasicParsing
    Write-Host "✓ Health check passed: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Import a spec first (required for environment tests)
Write-Host ""
Write-Host "2. Importing a test spec..." -ForegroundColor Yellow
$specBody = @{
    source = @{
        type = "url"
        url = "https://petstore3.swagger.io/api/v3/openapi.json"
    }
} | ConvertTo-Json -Depth 10

try {
    $specResponse = Invoke-RestMethod -Uri "$baseUrl/spec/import" -Method POST -Body $specBody -ContentType "application/json"
    $specId = $specResponse.specId
    Write-Host "✓ Spec imported: $specId" -ForegroundColor Green
    Write-Host "  Title: $($specResponse.title)" -ForegroundColor Gray
    Write-Host "  Operations: $($specResponse.operationCount)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Spec import failed: $_" -ForegroundColor Red
    Write-Host "  Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Create Environment (Phase 5)
Write-Host ""
Write-Host "3. Creating Environment (Phase 5)..." -ForegroundColor Yellow
$envBody = @{
    specId = $specId
    name = "test-env"
    baseUrl = "https://petstore3.swagger.io/api/v3"
    defaultHeaders = @{
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json -Depth 10

try {
    $envResponse = Invoke-RestMethod -Uri "$baseUrl/environments" -Method POST -Body $envBody -ContentType "application/json"
    $envId = $envResponse.id
    Write-Host "✓ Environment created: $envId" -ForegroundColor Green
    Write-Host "  Name: $($envResponse.name)" -ForegroundColor Gray
    Write-Host "  Base URL: $($envResponse.baseUrl)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Environment creation failed: $_" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: List Environments for Spec (Phase 5)
Write-Host ""
Write-Host "4. Listing Environments for Spec (Phase 5)..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-RestMethod -Uri "$baseUrl/spec/$specId/environments" -Method GET
    Write-Host "✓ Found $($listResponse.total) environment(s)" -ForegroundColor Green
    foreach ($env in $listResponse.environments) {
        Write-Host "  - $($env.name): $($env.baseUrl)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ List environments failed: $_" -ForegroundColor Red
}

# Test 5: Get Environment (Phase 5)
Write-Host ""
Write-Host "5. Getting Environment by ID (Phase 5)..." -ForegroundColor Yellow
try {
    $getEnvResponse = Invoke-RestMethod -Uri "$baseUrl/environments/$envId" -Method GET
    Write-Host "✓ Environment retrieved: $($getEnvResponse.name)" -ForegroundColor Green
} catch {
    Write-Host "✗ Get environment failed: $_" -ForegroundColor Red
}

# Test 6: Plan Run (Phase 6)
Write-Host ""
Write-Host "6. Planning a Run (Phase 6)..." -ForegroundColor Yellow
$planBody = @{
    specId = $specId
    envName = "test-env"
    selection = @{
        mode = "tag"
        tags = @("pet")
    }
} | ConvertTo-Json -Depth 10

try {
    $planResponse = Invoke-RestMethod -Uri "$baseUrl/execution/plan" -Method POST -Body $planBody -ContentType "application/json"
    $runId = $planResponse.runId
    Write-Host "✓ Run planned: $runId" -ForegroundColor Green
    Write-Host "  Operations: $($planResponse.operationCount)" -ForegroundColor Gray
    Write-Host "  Test Cases: $($planResponse.testCount)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Plan run failed: $_" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 7: Get Run Status (Phase 6)
Write-Host ""
Write-Host "7. Getting Run Status (Phase 6)..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/execution/status/$runId" -Method GET
    Write-Host "✓ Run status retrieved" -ForegroundColor Green
    Write-Host "  Status: $($statusResponse.status)" -ForegroundColor Gray
    Write-Host "  Steps: $($statusResponse.steps.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Get run status failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== All Tests Completed ===" -ForegroundColor Cyan
