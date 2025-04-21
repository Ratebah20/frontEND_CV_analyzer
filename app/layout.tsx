'use client';

import "@/styles/globals.css"
import { Inter } from "next/font/google"
import type React from "react" // Import React
import { UserProvider } from "./context/userContext"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  )
}