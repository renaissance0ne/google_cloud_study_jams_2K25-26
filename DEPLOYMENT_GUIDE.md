# 🚀 GCP Cloud Run Deployment Guide

This guide will help you deploy the Cloud Jam Leaderboard to Google Cloud Platform using Cloud Run and Cloud Storage.

---

## 📋 Prerequisites

1. **Google Cloud Platform Account**
   - Sign up at [cloud.google.com](https://cloud.google.com)
   - Enable billing (you get $300 free credits)

2. **Install Google Cloud CLI**
   ```bash
   # Download from: https://cloud.google.com/sdk/docs/install
   # Or use this quick installer:
   
   # Windows (PowerShell)
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

3. **Authenticate with GCloud**
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

---

## 🔧 Step 1: Set Up GCP Project

### 1.1 Create a New Project (or use existing)
```bash
# Create new project
gcloud projects create cloud-jam-leaderboard-2024 --name="Cloud Jam Leaderboard"

# Set as active project
gcloud config set project cloud-jam-leaderboard-2024
```

### 1.2 Enable Required APIs
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage.googleapis.com
```

### 1.3 Set Your Region
```bash
gcloud config set run/region us-central1
```

---

## 🪣 Step 2: Create Cloud Storage Bucket

### 2.1 Create the Bucket
```bash
# Replace with your project ID
export PROJECT_ID="cloud-jam-leaderboard-2024"
export BUCKET_NAME="cloud-jam-leaderboard-data"
export REGION="us-central1"

gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME
```

### 2.2 Upload Your CSV File
```bash
# From your project root
cd Cloud-Jam-Leaderboard-main
gsutil cp public/data.csv gs://$BUCKET_NAME/data.csv
```

### 2.3 Verify Upload
```bash
gsutil ls gs://$BUCKET_NAME
```

---

## 🐳 Step 3: Deploy to Cloud Run

### Option A: Automatic Deployment (Recommended)

1. **Edit `deploy.sh`** - Update these values:
   ```bash
   PROJECT_ID="cloud-jam-leaderboard-2024"  # Your project ID
   SERVICE_NAME="cloud-jam-leaderboard"
   REGION="us-central1"
   BUCKET_NAME="cloud-jam-leaderboard-data"
   ```

2. **Run the deployment script:**
   ```bash
   # On Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh

   # On Windows (PowerShell)
   bash deploy.sh
   ```

### Option B: Manual Deployment

```bash
# Set variables
export PROJECT_ID="cloud-jam-leaderboard-2024"
export SERVICE_NAME="cloud-jam-leaderboard"
export REGION="us-central1"
export BUCKET_NAME="cloud-jam-leaderboard-data"

# Deploy
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
```

### 3.1 What This Does:
- ✅ Builds your Docker image automatically
- ✅ Pushes to Google Container Registry
- ✅ Deploys to Cloud Run
- ✅ Makes it publicly accessible
- ✅ Sets environment variables

---

## 🔄 Step 4: Update CSV Data on GCP

### Method 1: Using the Swap Script
```bash
# From your project root
node scripts/swap-csv-gcp.js path/to/new-data.csv
```

### Method 2: Manual Upload
```bash
# Backup old file
gsutil cp gs://$BUCKET_NAME/data.csv gs://$BUCKET_NAME/backups/data-$(date +%Y%m%d-%H%M%S).csv

# Upload new file
gsutil cp public/data.csv gs://$BUCKET_NAME/data.csv
```

### 4.1 The app will automatically:
- Read the new CSV file on next request
- No redeployment needed! 🎉

---

## ✅ Step 5: Verify Deployment

### 5.1 Get Your App URL
```bash
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
```

### 5.2 Test the API
```bash
# Replace with your actual URL
curl https://cloud-jam-leaderboard-xxxxxxx-uc.a.run.app/api/leaderboard
```

### 5.3 Check Logs
```bash
gcloud run logs read $SERVICE_NAME --region $REGION --limit 50
```

---

## 🔐 Security & Permissions

### Grant Cloud Run Service Account Storage Access
```bash
# Get the service account
export SERVICE_ACCOUNT=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(spec.template.spec.serviceAccountName)')

# Grant storage access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/storage.objectViewer"
```

---

## 💰 Estimated Costs

For a leaderboard with moderate traffic:
- **Cloud Run**: ~$0-5/month (Free tier: 2M requests/month)
- **Cloud Storage**: ~$0.02-0.10/month (Minimal storage)
- **Total**: Likely **FREE** with GCP free tier!

---

## 🐛 Troubleshooting

### Issue 1: "Permission Denied" when reading CSV
**Solution:**
```bash
# Make bucket publicly readable (if appropriate)
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# OR grant service account access (more secure)
export SERVICE_ACCOUNT=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(spec.template.spec.serviceAccountName)')
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT:objectViewer gs://$BUCKET_NAME
```

### Issue 2: Build Fails
**Solution:**
```bash
# Check Docker build locally first
docker build -t test-build .
docker run -p 8080:8080 test-build
```

### Issue 3: Old Data Still Showing
**Solution:**
```bash
# Check what's in the bucket
gsutil cat gs://$BUCKET_NAME/data.csv | head -n 5

# Re-upload
gsutil cp public/data.csv gs://$BUCKET_NAME/data.csv

# Check logs
gcloud run logs read $SERVICE_NAME --region $REGION --limit 20
```

---

## 🔄 Redeployment (After Code Changes)

```bash
# Quick redeploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION

# Or just run the script again
./deploy.sh
```

---

## 📊 Monitoring

### View Metrics
```bash
# Open Cloud Run console
gcloud run services describe $SERVICE_NAME --region $REGION
```

### Set Up Alerts (Optional)
- Go to: [Cloud Console > Monitoring > Alerting](https://console.cloud.google.com/monitoring/alerting)
- Create alerts for high error rates or traffic spikes

---

## 🎉 You're Done!

Your leaderboard is now live on GCP! 

**Your app URL:** `https://cloud-jam-leaderboard-xxxxxxx-uc.a.run.app`

### Quick Commands Reference:
```bash
# View logs
gcloud run logs read cloud-jam-leaderboard --region us-central1 --limit 50

# Update CSV
gsutil cp public/data.csv gs://cloud-jam-leaderboard-data/data.csv

# Redeploy after code changes
gcloud run deploy cloud-jam-leaderboard --source . --region us-central1

# Delete service (cleanup)
gcloud run services delete cloud-jam-leaderboard --region us-central1
```

---

## 🆘 Need Help?

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- Check logs: `gcloud run logs read cloud-jam-leaderboard`


