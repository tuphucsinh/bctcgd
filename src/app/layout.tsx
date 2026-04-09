import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/ui/navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BCTC Gia Đình | Premium Finance",
  description: "Quản lý tài chính gia đình hiện đại, tinh gọn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-primary/30",
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col md:flex-row bg-background">
          <Navigation />
          <div className="flex-1 overflow-x-hidden pb-20 md:pb-0">
            {children}
          </div>
        </div>
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}
