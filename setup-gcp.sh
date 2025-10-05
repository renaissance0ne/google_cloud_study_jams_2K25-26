#!/bin/bash

# Quick GCP Setup Script
# This script will guide you through the initial setup

echo "=================================="
echo "🚀 Cloud Jam Leaderboard - GCP Setup"
echo "=================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed!"
    echo "📥 Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ Google Cloud CLI is installed"
echo ""

# Prompt for project ID
read -p "Enter your GCP Project ID (or press Enter for 'cloud-jam-leaderboard-2024'): " PROJECT_ID
PROJECT_ID=${PROJECT_ID:-cloud-jam-leaderboard-2024}

read -p "Enter your preferred region (or press Enter for 'us-central1'): " REGION
REGION=${REGION:-us-central1}

read -p "Enter your bucket name (or press Enter for 'cloud-jam-leaderboard-data'): " BUCKET_NAME
BUCKET_NAME=${BUCKET_NAME:-cloud-jam-leaderboard-data}

echo ""
echo "📋 Configuration:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Bucket: $BUCKET_NAME"
echo ""

read -p "Does this look correct? (y/n): " CONFIRM
if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo "❌ Setup cancelled"
    exit 1
fi

echo ""
echo "🔧 Setting up GCP project..."

# Set the project
gcloud config set project $PROJECT_ID

# Set the region
gcloud config set run/region $REGION

# Enable required APIs
echo "📡 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com

# Create bucket
echo "🪣 Creating Cloud Storage bucket..."
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"

# Upload CSV
echo "📤 Uploading data.csv to bucket..."
if [ -f "public/data.csv" ]; then
    gsutil cp public/data.csv gs://$BUCKET_NAME/data.csv
    echo "✅ CSV uploaded successfully"
else
    echo "⚠️  Warning: public/data.csv not found. Upload it manually later."
fi

# Update deploy.sh with the correct values
echo ""
echo "📝 Updating deploy.sh with your configuration..."
sed -i.bak "s/PROJECT_ID=\".*\"/PROJECT_ID=\"$PROJECT_ID\"/" deploy.sh
sed -i.bak "s/REGION=\".*\"/REGION=\"$REGION\"/" deploy.sh
sed -i.bak "s/BUCKET_NAME=\".*\"/BUCKET_NAME=\"$BUCKET_NAME\"/" deploy.sh
rm -f deploy.sh.bak

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📦 Next steps:"
echo "  1. Review deploy.sh to ensure settings are correct"
echo "  2. Run: ./deploy.sh"
echo "  3. Wait for deployment (2-5 minutes)"
echo "  4. Access your app at the URL shown after deployment"
echo ""
echo "💡 Useful commands:"
echo "  Deploy: ./deploy.sh"
echo "  View logs: gcloud run logs read cloud-jam-leaderboard --region $REGION"
echo "  Update CSV: gsutil cp public/data.csv gs://$BUCKET_NAME/data.csv"
echo ""


