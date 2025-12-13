$uid = '7b9743e9-fb19-4fb7-9512-c6c24e1d5ef4'
$origin = 'https://admin.shirasame.com'
$ts = [int](Get-Date -UFormat %s)
$title = "test-product-$ts"
$slug = "test-product-$ts"

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

Write-Host "Starting PRODUCTS CRUD test for user: $uid"

# 1) Create product
$body1 = @{ title = $title; slug = $slug; userId = $uid; published = $false; __perform = $true }
$created = safeInvoke -method 'POST' -url 'https://admin.shirasame.com/api/admin/products' -body $body1

# Extract created id
$prodId = $null
if ($created -and $created.data) { $prodId = $created.data.id }

# 2) List products (user scope)
$list = safeInvoke -method 'GET' -url "https://admin.shirasame.com/api/admin/products"

# 3) Get by id (query style)
if ($prodId) {
  $getq = safeInvoke -method 'GET' -url "https://admin.shirasame.com/api/products?id=$($prodId)"
} else { Write-Host "Skipping GET by id (no id)" }

# 4) Update product
if ($prodId) {
  $bodyUp = @{ title = "$title-updated" }
  $up = safeInvoke -method 'PUT' -url "https://admin.shirasame.com/api/admin/products/$($prodId)" -body $bodyUp
} else { Write-Host "Skipping UPDATE (no id)" }

# 5) Delete product
if ($prodId) {
  $del = safeInvoke -method 'DELETE' -url "https://admin.shirasame.com/api/admin/products/$($prodId)"
} else { Write-Host "Skipping DELETE (no id)" }

Write-Host 'PRODUCTS TEST COMPLETE'
