# 🏆 Google Cloud Study Jams Leaderboard

A modern, dynamic leaderboard application built with **Next.js 13** to track Google Cloud Study Jams participants, their skill badges, and arcade game completions. Deployed on **Google Cloud Platform** using Cloud Run and Cloud Storage.

![Cloud Study Jams](https://img.shields.io/badge/Google_Cloud-Study_Jams-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Cloud_Run-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Updating Data](#-updating-data)
- [Deployment](#-deployment)
- [How It Works](#-how-it-works)
- [Contributing](#-contributing)

---

## ✨ Features

- 🔄 **Dynamic CSV Data Loading** - No redeployment needed for data updates
- 🎯 **Real-time Leaderboard** - Live participant tracking and rankings
- 📊 **Detailed Participant View** - Click to see full badge and game completion details
- 🔍 **Smart Search** - Search by name, email, or profile status
- 📱 **Fully Responsive** - Works seamlessly on desktop and mobile
- ☁️ **Cloud-Native** - Deployed on Google Cloud Run with Cloud Storage integration
- 🎨 **Modern UI** - Beautiful, clean interface with Tailwind CSS
- ⚡ **Fast & Efficient** - Server-side rendering and optimized API routes

---

## 🛠️ Tech Stack

| Technology               | Purpose                               |
| ------------------------ | ------------------------------------- |
| **Next.js 13**           | React framework with App Router       |
| **React**                | UI library for component-based design |
| **Tailwind CSS**         | Utility-first CSS framework           |
| **PapaParse**            | CSV parsing library                   |
| **Google Cloud Storage** | CSV data storage                      |
| **Google Cloud Run**     | Serverless deployment platform        |
| **Docker**               | Containerization for deployment       |

---

## 📁 Project Structure

```
Cloud-Jam-Leaderboard-main/
├── src/
│   ├── app/                          # Next.js 13 App Router
│   │   ├── api/
│   │   │   └── leaderboard/
│   │   │       └── route.js          # API endpoint for data fetching
│   │   ├── participant/
│   │   │   └── page.js               # Participant detail page
│   │   ├── globals.css               # Global styles
│   │   ├── layout.js                 # Root layout with metadata
│   │   └── page.js                   # Homepage with leaderboard
│   ├── components/                   # React components
│   │   ├── Table.Index.js            # Main leaderboard table
│   │   ├── TableBody.js              # Table body wrapper
│   │   ├── DynamicTableRow.js        # Individual table rows
│   │   ├── DynamicTableHeader.js     # Dynamic table headers
│   │   └── Speedometer.js            # Stats speedometer
│   ├── config/
│   │   └── tableConfig.js            # Table column configuration
│   └── fonts/                        # Custom fonts
├── public/
│   ├── assets/                       # Images and static assets
│   └── data.csv                      # CSV data file (local dev)
├── scripts/
│   ├── swap-csv-local.js             # Local CSV swap utility
│   └── swap-csv-gcp.js               # GCP CSV swap utility
├── data/                             # Data folder for new CSV files
├── Dockerfile                        # Docker build configuration
├── .dockerignore                     # Docker ignore patterns
├── .gcloudignore                     # GCloud ignore patterns
├── deploy.sh                         # Deployment automation script
├── setup-gcp.sh                      # GCP setup script (Bash)
├── setup-gcp.ps1                     # GCP setup script (PowerShell)
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── package.json                      # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Google Cloud CLI** (for deployment) ([Install](https://cloud.google.com/sdk/docs/install))
- **Google Cloud Account** (for deployment)

### Local Development

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd Cloud-Jam-Leaderboard-main
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Add your CSV data:**

   Place your `data.csv` file in the `public/` directory with these headers:

   ```csv
   User Name,User Email,Google Cloud Skills Boost Profile URL,Profile URL Status,Access Code Redemption Status,All Skill Badges & Games Completed,# of Skill Badges Completed,Names of Completed Skill Badges,# of Arcade Games Completed,Names of Completed Arcade Games
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open in browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

### Table Columns (`src/config/tableConfig.js`)

Customize which columns appear on the leaderboard:

```javascript
export const COLUMN_CONFIG = [
  {
    key: "User Name", // CSV column name
    label: "Name", // Display label
    visible: true, // Show on leaderboard
    mobileVisible: true, // Show on mobile
    className: "User_Name p-3", // CSS classes
    render: (value, row) => {
      // Custom rendering
      // Your custom logic
    },
  },
  // ... more columns
];
```

### Eligibility Badge

Configure the eligibility criteria in `tableConfig.js`:

```javascript
export const ELIGIBILITY_CONFIG = {
  field: "All Skill Badges & Games Completed",
  eligibleValue: "Yes",
};
```

Participants meeting this criteria get a 🏅 badge next to their name.

---

## 🔄 Updating Data

### Local Development

**Option 1: Direct Replacement**

```bash
# Simply replace the file
cp new-data.csv public/data.csv
```

**Option 2: Using Swap Script**

```bash
# Place new CSV in data/ folder
node scripts/swap-csv-local.js data/new-data.csv
```

### Production (GCP)

**Option 1: Direct Upload**

```bash
gsutil cp public/data.csv gs://cloud-jam-leaderboard-data/data.csv
```

**Option 2: Using Swap Script** (creates backup automatically)

```bash
node scripts/swap-csv-gcp.js data/new-data.csv
```

**🎉 Changes are live immediately - NO redeployment needed!**

---

## ☁️ Deployment

### Quick Deployment (5 Minutes)

See **[GCP-QUICK-START.md](./GCP-QUICK-START.md)** for a streamlined guide.

### Detailed Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for comprehensive instructions.

### One-Command Deployment

```bash
# 1. Setup (first time only)
bash setup-gcp.sh      # or setup-gcp.ps1 for Windows

# 2. Deploy
bash deploy.sh
```

---

## 🧩 How It Works

### Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
│              http://your-app.run.app                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js App (Cloud Run)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Route: /api/leaderboard                     │  │
│  │  • Detects environment (local/GCP)               │  │
│  │  • Reads CSV from storage                        │  │
│  │  • Parses with PapaParse                         │  │
│  │  • Returns JSON to frontend                      │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          Google Cloud Storage Bucket                    │
│          gs://cloud-jam-leaderboard-data/               │
│          └── data.csv (dynamic data source)             │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User visits** the leaderboard page
2. **Next.js API** (`/api/leaderboard`) is called
3. **Environment detection:**
   - **Local:** Reads `public/data.csv`
   - **GCP:** Reads from Cloud Storage bucket
4. **CSV parsing** with PapaParse
5. **Type conversion** (strings → numbers for numeric fields)
6. **JSON response** sent to frontend
7. **React components** render the table dynamically

### Key Components

#### 1. **API Route** (`src/app/api/leaderboard/route.js`)

- Fetches CSV from local file system or GCP Storage
- Parses CSV into JSON format
- Handles type conversion automatically
- Returns structured data to frontend

#### 2. **Table Configuration** (`src/config/tableConfig.js`)

- Defines which columns to display
- Configures column labels and styling
- Sets mobile visibility
- Enables custom rendering logic

#### 3. **Dynamic Table Components**

- `Table.Index.js`: Main container with search
- `DynamicTableHeader.js`: Renders headers from config
- `DynamicTableRow.js`: Renders data rows with "View Details" button
- `TableBody.js`: Maps data to rows

#### 4. **Participant Detail Page** (`src/app/participant/page.js`)

- Displays full participant information
- Parses pipe-separated badge/game names
- Shows completed badges and games in list format

---

## 📊 CSV Data Format

Your CSV file must have these exact headers:

| Header                                  | Type   | Description                     |
| --------------------------------------- | ------ | ------------------------------- |
| `User Name`                             | String | Participant's full name         |
| `User Email`                            | String | Participant's email (unique ID) |
| `Google Cloud Skills Boost Profile URL` | String | Public profile link             |
| `Profile URL Status`                    | String | "All Good" or other status      |
| `Access Code Redemption Status`         | String | "Yes" or "No"                   |
| `All Skill Badges & Games Completed`    | String | "Yes" or "No"                   |
| `# of Skill Badges Completed`           | Number | Count of badges                 |
| `Names of Completed Skill Badges`       | String | Badge names separated by `\|`   |
| `# of Arcade Games Completed`           | Number | Count of games                  |
| `Names of Completed Arcade Games`       | String | Game names separated by `\|`    |

**Example CSV Row:**

```csv
John Doe,john@example.com,https://cloudskillsboost.google/...,All Good,Yes,Yes,5,Badge 1 | Badge 2 | Badge 3,3,Game 1 | Game 2
```

---

## 🎨 Customization

### Colors & Branding

1. **Update logo images** in `public/assets/`
2. **Modify colors** in `src/app/globals.css`
3. **Edit metadata** in `src/app/layout.js` for SEO and social sharing

### Table Appearance

Edit `src/config/tableConfig.js` to:

- Show/hide columns
- Change column labels
- Add custom rendering
- Modify mobile visibility

---

## 🐛 Troubleshooting

### "Module not found: Can't resolve 'encoding'"

- This is a known Next.js warning with Google Cloud Storage SDK
- **Safe to ignore** - doesn't affect production

### Old data still showing

- **Hard refresh:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Wait 30 seconds for Cloud Storage cache

### Deployment fails

- Check GCP quotas and billing
- Verify project ID and bucket name
- Check Cloud Build and Cloud Run logs

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available for educational purposes.

---

## 🙏 Acknowledgments

- **Google Cloud Platform** for hosting and storage
- **Next.js Team** for the amazing framework
- **GDSC/GDGC Community** for inspiration

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ by GDGC CMRIT**
