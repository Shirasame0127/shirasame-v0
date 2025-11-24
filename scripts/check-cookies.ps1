# Simple script to call the debug endpoint and print JSON
$uri = 'http://localhost:3000/api/debug/auth-check'
Write-Host "Calling $uri ..."
try {
    $r = Invoke-RestMethod -Uri $uri -Method GET -UseBasicParsing -Headers @{ 'Accept' = 'application/json' }
    Write-Host "-- Response --"
    $r | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Request failed:" $_.Exception.Message
}
