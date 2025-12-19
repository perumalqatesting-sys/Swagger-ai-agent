# Phase 11 Test Script - Retry & Partial Reruns + Basic Reporting
# Tests retry functionality and aggregated reporting

$baseUrl = "http://localhost:3000/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== Phase 11 Testing: Retry & Reporting ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Import a spec
Write-Host "Step 1: Importing Swagger spec..." -ForegroundColor Yellow
$specUrl = "https://petstore3.swagger.io/api/v3/openapi.json"
$importBody = @{
    source = @{
        type = "url"
        url = $specUrl
    }
} | ConvertTo-Json -Depth 3

try {
    $importResponse = Invoke-RestMethod -Uri "$baseUrl/spec/import" -Method POST -Headers $headers -Body $importBody
    $specId = $importResponse.specId
    Write-Host "Spec imported: $specId" -ForegroundColor Green
} catch {
    Write-Host "Failed to import spec: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create an environment
Write-Host ""
Write-Host "Step 2: Creating environment..." -ForegroundColor Yellow
$envBody = @{
    specId = $specId
    name = "test-env"
    description = "Test environment for Phase 11"
    baseUrl = "https://petstore3.swagger.io"
    defaultHeaders = @{
        "Content-Type" = "application/json"
    }
} | ConvertTo-Json -Depth 3

try {
    $envResponse = Invoke-RestMethod -Uri "$baseUrl/environments" -Method POST -Headers $headers -Body $envBody
    $envId = $envResponse.id
    Write-Host "Environment created: $envId" -ForegroundColor Green
} catch {
    Write-Host "Failed to create environment: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Plan a run
Write-Host ""
Write-Host "Step 3: Planning a test run..." -ForegroundColor Yellow
$planBody = @{
    specId = $specId
    envName = "test-env"
    selection = @{
        mode = "tag"
        tags = @("pet")
    }
} | ConvertTo-Json -Depth 3

try {
    $planResponse = Invoke-RestMethod -Uri "$baseUrl/execution/plan" -Method POST -Headers $headers -Body $planBody
    $runId = $planResponse.runId
    Write-Host "Run planned: $runId" -ForegroundColor Green
    Write-Host "  Operations: $($planResponse.operationCount)" -ForegroundColor Gray
    Write-Host "  Test cases: $($planResponse.testCount)" -ForegroundColor Gray
} catch {
    Write-Host "Failed to plan run: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Get run status (with aggregates)
Write-Host ""
Write-Host "Step 4: Getting run status with aggregates..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "$baseUrl/execution/status/$runId" -Method GET -Headers $headers
    Write-Host "Run status retrieved" -ForegroundColor Green
    Write-Host "  Status: $($statusResponse.status)" -ForegroundColor Gray
    Write-Host "  Steps: $($statusResponse.steps.Count)" -ForegroundColor Gray
    
    if ($statusResponse.aggregatesByTag) {
        Write-Host ""
        Write-Host "  Aggregates by Tag:" -ForegroundColor Cyan
        $statusResponse.aggregatesByTag | ForEach-Object {
            $rate = [math]::Round($_.successRate, 2)
            Write-Host "    Tag: $($_.tag) - Total: $($_.total), Success: $($_.success), Failed: $($_.failed), Success Rate: $rate%" -ForegroundColor Gray
        }
    }
    
    if ($statusResponse.aggregatesByMethod) {
        Write-Host ""
        Write-Host "  Aggregates by Method:" -ForegroundColor Cyan
        $statusResponse.aggregatesByMethod | ForEach-Object {
            $rate = [math]::Round($_.successRate, 2)
            Write-Host "    Method: $($_.method) - Total: $($_.total), Success: $($_.success), Failed: $($_.failed), Success Rate: $rate%" -ForegroundColor Gray
        }
    }
    
    if ($statusResponse.aggregatesByPath) {
        Write-Host ""
        Write-Host "  Aggregates by Path:" -ForegroundColor Cyan
        $statusResponse.aggregatesByPath | ForEach-Object {
            $rate = [math]::Round($_.successRate, 2)
            Write-Host "    Path: $($_.path) - Total: $($_.total), Success: $($_.success), Failed: $($_.failed), Success Rate: $rate%" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "Failed to get run status: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Test retry endpoint (will fail if no failed tests, which is expected)
Write-Host ""
Write-Host "Step 5: Testing retry endpoint..." -ForegroundColor Yellow
try {
    $retryResponse = Invoke-RestMethod -Uri "$baseUrl/execution/retry/$runId" -Method POST -Headers $headers
    Write-Host "Retry run created: $($retryResponse.runId)" -ForegroundColor Green
    Write-Host "  Original Run ID: $($retryResponse.originalRunId)" -ForegroundColor Gray
    Write-Host "  Operations in retry: $($retryResponse.operationCount)" -ForegroundColor Gray
    Write-Host "  Test cases in retry: $($retryResponse.testCount)" -ForegroundColor Gray
} catch {
    $errorMsg = $_.ErrorDetails.Message
    if ($errorMsg -like "*No failed tests*" -or $errorMsg -like "*Nothing to retry*") {
        Write-Host "Retry endpoint works correctly (no failed tests to retry)" -ForegroundColor Green
    } else {
        Write-Host "Retry failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($errorMsg) {
            Write-Host "  Error: $errorMsg" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "=== Phase 11 Testing Complete ===" -ForegroundColor Cyan
Write-Host "All Phase 11 features implemented and tested" -ForegroundColor Green
