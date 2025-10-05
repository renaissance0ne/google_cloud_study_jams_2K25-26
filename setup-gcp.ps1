# Quick GCP Setup Script for Windows PowerShell
# Run this script to set up your GCP environment

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "🚀 Cloud Jam Leaderboard - GCP Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
    Write-Host "✅ Google Cloud CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Google Cloud CLI is not installed!" -ForegroundColor Red
    Write-Host "📥 Please install it from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Prompt for configuration
$PROJECT_ID = Read-Host "Enter your GCP Project ID (or press Enter for 'cloud-jam-leaderboard-2024')"
if ([string]::IsNullOrWhiteSpace($PROJECT_ID)) {
    $PROJECT_ID = "cloud-jam-leaderboard-2024"
}

$REGION = Read-Host "Enter your preferred region (or press Enter for 'us-central1')"
if ([string]::IsNullOrWhiteSpace($REGION)) {
    $REGION = "us-central1"
}

$BUCKET_NAME = Read-Host "Enter your bucket name (or press Enter for 'cloud-jam-leaderboard-data')"
if ([string]::IsNullOrWhiteSpace($BUCKET_NAME)) {
    $BUCKET_NAME = "cloud-jam-leaderboard-data"
}

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Project ID: $PROJECT_ID"
Write-Host "  Region: $REGION"
Write-Host "  Bucket: $BUCKET_NAME"
Write-Host ""

$CONFIRM = Read-Host "Does this look correct? (y/n)"
if ($CONFIRM -ne "y" -and $CONFIRM -ne "Y") {
    Write-Host "❌ Setup cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Setting up GCP project..." -ForegroundColor Cyan

# Set the project
gcloud config set project $PROJECT_ID

# Set the region
gcloud config set run/region $REGION

# Enable required APIs
Write-Host "📡 Enabling required APIs..." -ForegroundColor Cyan
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com

# Create bucket
Write-Host "🪣 Creating Cloud Storage bucket..." -ForegroundColor Cyan
$bucketExists = gsutil ls gs://$BUCKET_NAME 2>$null
if ($LASTEXITCODE -ne 0) {
    gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME
} else {
    Write-Host "Bucket already exists" -ForegroundColor Yellow
}

# Upload CSV
Write-Host "📤 Uploading data.csv to bucket..." -ForegroundColor Cyan
if (Test-Path "public\data.csv") {
    gsutil cp public\data.csv gs://$BUCKET_NAME/data.csv
    Write-Host "✅ CSV uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: public\data.csv not found. Upload it manually later." -ForegroundColor Yellow
}

# Update deploy.sh with the correct values
Write-Host ""
Write-Host "📝 Updating deploy.sh with your configuration..." -ForegroundColor Cyan
if (Test-Path "deploy.sh") {
    $deployContent = Get-Content "deploy.sh" -Raw
    $deployContent = $deployContent -replace 'PROJECT_ID="[^"]*"', "PROJECT_ID=`"$PROJECT_ID`""
    $deployContent = $deployContent -replace 'REGION="[^"]*"', "REGION=`"$REGION`""
    $deployContent = $deployContent -replace 'BUCKET_NAME="[^"]*"', "BUCKET_NAME=`"$BUCKET_NAME`""
    Set-Content "deploy.sh" $deployContent
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review deploy.sh to ensure settings are correct"
Write-Host "  2. Run deployment:"
Write-Host "     bash deploy.sh" -ForegroundColor Cyan
Write-Host "     OR manually run the gcloud command from DEPLOYMENT_GUIDE.md"
Write-Host "  3. Wait for deployment (2-5 minutes)"
Write-Host "  4. Access your app at the URL shown after deployment"
Write-Host ""
Write-Host "💡 Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs: gcloud run logs read cloud-jam-leaderboard --region $REGION"
Write-Host "  Update CSV: gsutil cp public\data.csv gs://$BUCKET_NAME/data.csv"
Write-Host "  Check status: gcloud run services describe cloud-jam-leaderboard --region $REGION"
Write-Host ""


