param(
  [string]$BaseUrl = "http://localhost:3000"
)

$uri = "$BaseUrl/api/images/direct-upload"
Write-Host "POST -> $uri"
try {
  $res = Invoke-WebRequest -Uri $uri -Method POST -ContentType 'application/json' -Body (@{} | ConvertTo-Json) -UseBasicParsing -TimeoutSec 30
  $status = $res.StatusCode
  $body = $res.Content | ConvertFrom-Json
  Write-Host "Status: $status"
  if ($body.result -ne $null) {
    Write-Host "Result keys: " ($body.result | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name -ErrorAction SilentlyContinue)
    if ($body.result.publicUrl) {
      Write-Host "publicUrl: $($body.result.publicUrl)"
    } else {
      Write-Host "publicUrl not present in response. Full response:"
      $body | ConvertTo-Json -Depth 5 | Write-Host
    }
  } else {
    Write-Host "No result object in response. Full response:"
    $body | ConvertTo-Json -Depth 5 | Write-Host
  }
} catch {
  Write-Host 'Request failed:' $_.Exception.Message
}

Write-Host "Done. If your Next dev server is not running, start it (e.g. `pnpm dev` in the app folder) and re-run this script."