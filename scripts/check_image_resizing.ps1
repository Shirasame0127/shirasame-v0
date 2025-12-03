param(
  [Parameter(Mandatory=$true)][string]$PublicUrl
)

$widths = @(200,400,800)
Write-Host "Checking Image Resizing for base URL: $PublicUrl"

foreach ($w in $widths) {
  $u = if ($PublicUrl -match "\?") { "$PublicUrl&width=$w" } else { "$PublicUrl?width=$w" }
  Write-Host "\nRequesting width=$w -> $u"
  try {
    $res = Invoke-WebRequest -Method Head -Uri $u -UseBasicParsing -TimeoutSec 15
    Write-Host "Status: $($res.StatusCode)"
    $headers = $res.Headers
    if ($headers['cf-cache-status']) { Write-Host "cf-cache-status: $($headers['cf-cache-status'])" }
    if ($headers['content-length']) { Write-Host "content-length: $($headers['content-length'])" }
    if ($headers['content-type']) { Write-Host "content-type: $($headers['content-type'])" }
    if ($headers['cache-control']) { Write-Host "cache-control: $($headers['cache-control'])" }
  } catch {
    Write-Host "Request failed: $_.Exception.Message"
  }
}

Write-Host "\nNote: If you see successful 200 responses and `cf-cache-status` values, Image Resizing is processing requests. For first requests you may see MISS due to conversion and edge population."