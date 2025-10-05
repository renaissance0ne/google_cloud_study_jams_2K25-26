#!/bin/bash

# Deployment script for Cloud Run
# Make sure you have gcloud CLI installed and authenticated

# Configuration
PROJECT_ID="your-project-id"
SERVICE_NAME="cloud-jam-leaderboard"
REGION="us-central1"
BUCKET_NAME="cloud-jam-leaderboard-data"

echo "🚀 Starting deployment to Cloud Run..."

# Set the project
echo "Setting GCP project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com

# Create storage bucket if it doesn't exist
echo "Creating/Verifying Storage Bucket..."
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"

# Upload CSV to bucket
echo "Uploading data.csv to bucket..."
gsutil cp public/data.csv gs://$BUCKET_NAME/data.csv

# Build and deploy to Cloud Run
echo "Building and deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GCS_BUCKET_NAME=$BUCKET_NAME,CSV_FILE_NAME=data.csv" \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080

echo "✅ Deployment complete!"
echo "Your app should be live at the URL shown above."


