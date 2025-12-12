$uid = '7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4'
$origin = 'https://admin.shirasame.com'
$ts = [int](Get-Date -UFormat %s)
$groupName = "test-group-$ts"
$newGroupName = "$groupName-renamed"
$tagName = "test-tag-$ts"

function safeInvoke($method, $url, $body=$null) {
  try {
    if ($body -ne $null) {
      $json = ConvertTo-Json $body -Depth 10
      $res = Invoke-RestMethod -Uri $url -Method $method -Headers @{ "Origin"=$origin; "X-User-Id"=$uid } -Body $json -ContentType 'application/json' -ErrorAction Stop
    } else {
      $res = Invoke-RestMethod -Uri $url -Method $method -Headers @{ "Origin"=$origin; "X-User-Id"=$uid } -ErrorAction Stop
    }
    Write-Host "OK: $method $url" -ForegroundColor Green
    $res | ConvertTo-Json -Depth 10 | Write-Host
    return $res
  } catch {
    Write-Host "ERROR: $method $url" -ForegroundColor Red
    try { $content = $_.Exception.Response.Content.ReadAsStringAsync().Result; Write-Host $content } catch { Write-Host $_.Exception.Message }
    return $null
  }
}

Write-Host "Starting CRUD test for user: $uid"

# 1) Create tag group
$body1 = @{ name = $groupName; label = "Test Group $ts"; userId = $uid }
$g = safeInvoke -method 'POST' -url 'https://admin.shirasame.com/api/admin/tag-groups' -body $body1

# 2) Create tag (custom)
$body2 = @{ tags = @(@{ name = $tagName; group = $groupName }) ; userId = $uid }
$t = safeInvoke -method 'POST' -url 'https://admin.shirasame.com/api/admin/tags/custom' -body $body2

# 3) List tags
$tags = safeInvoke -method 'GET' -url "https://admin.shirasame.com/api/tags"

# 4) Rename tag group
$body3 = @{ name = $groupName; newName = $newGroupName; label = "Renamed $ts"; userId = $uid }
$rg = safeInvoke -method 'PUT' -url 'https://admin.shirasame.com/api/admin/tag-groups' -body $body3

# 5) Update created tag via save (find id first)
$tagId = $null
if ($tags -and $tags.data) {
  foreach ($item in $tags.data) { if ($item.name -eq $tagName) { $tagId = $item.id } }
}
if ($tagId) {
  $body4 = @{ tags = @(@{ id = $tagId; name = "$tagName-updated"; group = $newGroupName }); userId = $uid }
  $up = safeInvoke -method 'POST' -url 'https://admin.shirasame.com/api/admin/tags/save' -body $body4
} else { Write-Host "Tag id not found; skipping update" }

Write-Host 'TEST COMPLETE'