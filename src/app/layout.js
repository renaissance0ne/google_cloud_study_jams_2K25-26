import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/contexts/ThemeContext'


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Google Cloud Study Jams 25-26 | GDGC CMRIT",
  description: "Live leaderboard for Google Cloud Study Jams 2025-26. Track skill badges, arcade games, and participant progress at CMR Institute of Technology.",
  keywords: ["Google Cloud", "Study Jams", "GCCP", "GDGC CMRIT", "Leaderboard", "Cloud Skills"],
  authors: [{ name: "GDGC CMRIT" }],
  creator: "GDGC CMRIT",
  publisher: "GDGC CMRIT",
  robots: "index,follow",
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: "Google Cloud Study Jams 25-26 | GDGC CMRIT",
    description: "Live leaderboard for Google Cloud Study Jams 2025-26. Track skill badges, arcade games, and participant progress.",
    url: "https://cloud-jam-leaderboard-1114088229.asia-south1.run.app",
    siteName: "Cloud Jam CMRIT Leaderboard",
    locale: "en_US",
    type: "website",
  },
  
  // Twitter Card metadata
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Google Cloud Study Jams 25-26 | GDGC CMRIT",
  //   description: "Live leaderboard for Google Cloud Study Jams 2025-26. Track skill badges, arcade games, and participant progress.",
  //   images: ["https://raw.githubusercontent.com/fenilmodi00/GCCP-Jams/main/public/assets/Screenshot%202023-09-12%20191408.png"],
  //   creator: "@gdgcCMRIT",
  // },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="icon" href="/favicon.ico" />
      <head>
        
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 transition-colors duration-200`}>
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
