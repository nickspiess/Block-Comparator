import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define your local TTF font
const customFont = localFont({
  src: '../public/fonts/frostbite.ttf',  // Update with your TTF filename
  variable: '--font-custom'
});

export const metadata: Metadata = {
  title: "Block Comparator",
  description: "Let's Learn with some Blocks!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${customFont.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}