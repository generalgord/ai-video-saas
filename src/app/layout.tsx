import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Tailwind ve Shadcn'in aradığı değişken isimleriyle güncelledik:
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VideoSaaS Platformu",
  description: "Yapay zeka ile anında video üretin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning eklentisi ileride dark mode kurarken bizi hatalardan koruyacak
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950`}>
        {children}
      </body>
    </html>
  );
}