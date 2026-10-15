# Start Cloud SQL Proxy for local development
# This connects to the Auxlo GCP database (auxlo-503209:europe-west2:auxlo-db)
# and makes it available on localhost:5432

$ProxyPath = "C:\Users\kabon\Documents\Auxlo\cloud-sql-proxy.exe"
$InstanceName = "auxlo-503209:europe-west2:auxlo-db"
$Port = "5432"

Write-Host "Starting Cloud SQL Proxy..." -ForegroundColor Green
Write-Host "Instance: $InstanceName" -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proxy logs will be written to proxy_log.txt" -ForegroundColor Yellow
Write-Host ""

& $ProxyPath `
  $InstanceName `
  --port $Port `
  --gcloud-auth `
  2>&1 | Tee-Object -FilePath "proxy_log.txt"
