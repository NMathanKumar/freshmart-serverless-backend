$base = 'http://localhost:4000/api/v1'
$token = (Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType 'application/json' -Body '{"email":"admin@freshmart.com","password":"Test@1234"}').data.accessToken
$h = @{ Authorization = "Bearer $token" }

Write-Output "=== 1. CREATE FOOD ==="
$body = '{"name":"Veg Biryani","description":"Spiced rice with vegetables","category":"Main Course","price":110,"imageUrl":"https://example.com/biryani.jpg","available":true,"preparationTime":20}'
$create = Invoke-RestMethod -Uri "$base/food" -Method POST -ContentType 'application/json' -Headers $h -Body $body
$create | ConvertTo-Json -Depth 5
$foodId = $create.data.foodId
Write-Output "Captured foodId: $foodId"

Write-Output "=== 2. GET ALL FOODS ==="
Invoke-RestMethod -Uri "$base/food" -Method GET -Headers $h | ConvertTo-Json -Depth 4

Write-Output "=== 3. SEARCH FOOD ==="
Invoke-RestMethod -Uri "$base/food/search?q=Biryani" -Method GET -Headers $h | ConvertTo-Json -Depth 4

Write-Output "=== 4. GET FOOD BY ID ==="
Invoke-RestMethod -Uri "$base/food/$foodId" -Method GET -Headers $h | ConvertTo-Json -Depth 4

Write-Output "=== 5. UPDATE FOOD ==="
Invoke-RestMethod -Uri "$base/food/$foodId" -Method PUT -ContentType 'application/json' -Headers $h -Body '{"price":125,"preparationTime":25}' | ConvertTo-Json -Depth 4

Write-Output "=== 6. CHANGE AVAILABILITY ==="
Invoke-RestMethod -Uri "$base/food/$foodId/availability" -Method PATCH -ContentType 'application/json' -Headers $h -Body '{"available":false}' | ConvertTo-Json -Depth 4

Write-Output "=== 7. DELETE FOOD ==="
Invoke-RestMethod -Uri "$base/food/$foodId" -Method DELETE -Headers $h | ConvertTo-Json -Depth 4
