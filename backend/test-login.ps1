
$headers = @{ "Content-Type" = "application/json" }

Write-Host "--- Test 1: Empty Body ---"
try {
    Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Headers $headers -Body "{}"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n--- Test 2: Invalid Password ---"
try {
    $body = @{ username = "admin"; password = "wrongpass" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Headers $headers -Body $body
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n--- Test 3: Valid User (fiverr.alikhan@gmail.com) ---"
try {
    $body = @{ identifier = "fiverr.alikhan@gmail.com"; password = "123456" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Headers $headers -Body $body
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n--- Test 4: Valid User (alikhanse248@gmail.com) ---"
try {
    $body = @{ identifier = "alikhanse248@gmail.com"; password = "alikhan123" } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -Headers $headers -Body $body
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
