# 🚀 GCP Deployment - Quick Start

## ⚡ Super Quick Deployment (5 Minutes)

### 1️⃣ **Install Google Cloud CLI**
```bash
# Download and install from:
https://cloud.google.com/sdk/docs/install

# After installation, restart your terminal and verify:
gcloud --version
```

### 2️⃣ **Authenticate**
```bash
gcloud auth login
```

### 3️⃣ **Run Setup Script**

**Windows (PowerShell):**
```powershell
cd Cloud-Jam-Leaderboard-main
.\setup-gcp.ps1
```

**Linux/Mac:**
```bash
cd Cloud-Jam-Leaderboard-main
chmod +x setup-gcp.sh
./setup-gcp.sh
```

### 4️⃣ **Deploy**

**Option A - Using Script:**
```bash
bash deploy.sh
```

**Option B - Manual Command:**
```bash
gcloud run deploy cloud-jam-leaderboard \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=your-project-id,GCS_BUCKET_NAME=cloud-jam-leaderboard-data,CSV_FILE_NAME=data.csv" \
  --memory 512Mi \
  --port 8080
```

### 5️⃣ **Done! 🎉**
Your app URL will be shown after deployment:
```
https://cloud-jam-leaderboard-xxxxxxxx-uc.a.run.app
```

---

## 📝 Common Commands

### Update CSV Data
```bash
# Method 1: Using script
node scripts/swap-csv-gcp.js path/to/new-data.csv

# Method 2: Direct upload
gsutil cp public/data.csv gs://cloud-jam-leaderboard-data/data.csv
```

### View Logs
```bash
gcloud run logs read cloud-jam-leaderboard --region us-central1 --limit 50
```

### Redeploy (after code changes)
```bash
bash deploy.sh
# OR
gcloud run deploy cloud-jam-leaderboard --source . --region us-central1
```

### Check Service Status
```bash
gcloud run services describe cloud-jam-leaderboard --region us-central1
```

### Get App URL
```bash
gcloud run services describe cloud-jam-leaderboard --region us-central1 --format 'value(status.url)'
```

---

## 🐛 Quick Troubleshooting

### Problem: CSV not updating
```bash
# Check what's in the bucket
gsutil cat gs://cloud-jam-leaderboard-data/data.csv | head

# Re-upload
gsutil cp public/data.csv gs://cloud-jam-leaderboard-data/data.csv
```

### Problem: Permission errors
```bash
# Grant service account storage access
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:$(gcloud run services describe cloud-jam-leaderboard --region us-central1 --format 'value(spec.template.spec.serviceAccountName)')" \
  --role="roles/storage.objectViewer"
```

### Problem: Build fails
```bash
# Test Docker build locally
docker build -t test-leaderboard .
docker run -p 8080:8080 test-leaderboard
```

---

## 💰 Pricing Estimate

- **Cloud Run**: FREE (within free tier: 2M requests/month)
- **Cloud Storage**: ~$0.02/month
- **Total**: Essentially FREE! 🎉

---

## 📚 Full Documentation

For detailed instructions, see: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## ✅ Deployment Checklist

- [ ] Google Cloud CLI installed
- [ ] Authenticated with `gcloud auth login`
- [ ] Project created/selected
- [ ] APIs enabled (cloudbuild, run, storage)
- [ ] Bucket created
- [ ] CSV uploaded to bucket
- [ ] App deployed to Cloud Run
- [ ] Environment variables set
- [ ] App URL accessible
- [ ] Tested CSV update

---

## 🆘 Need Help?

1. Check logs: `gcloud run logs read cloud-jam-leaderboard`
2. Read full guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. GCP Documentation: https://cloud.google.com/run/docs


