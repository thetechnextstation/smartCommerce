import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MiniCart } from "@/components/MiniCart";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartCommerce - AI-Powered Shopping Experience",
  description: "Experience the future of online shopping with AI-powered semantic search, smart recommendations, and dynamic pricing.",
  keywords: ["e-commerce", "AI shopping", "smart commerce", "online store"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white flex flex-col min-h-screen`}>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <MiniCart />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
