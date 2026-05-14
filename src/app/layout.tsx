import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
});

const latin = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
});

export const metadata: Metadata = {
  title: "ই-হিসেব | ওয়ার্কশপ ম্যানেজমেন্ট",
  description: "বাংলাদেশি ওয়ার্কশপ ও গ্যারেজের জন্য ম্যানেজমেন্ট সিস্টেম",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${bangla.variable} ${latin.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
