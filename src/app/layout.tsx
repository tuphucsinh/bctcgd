import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Navigation } from "@/components/ui/navigation";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "BCTC Gia Đình | Premium Finance",
  description: "Quản lý tài chính gia đình hiện đại, tinh gọn.",
};

// P1-5: Các routes không cần Navigation (auth pages)
const AUTH_ROUTES = ['/login'];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // Kiểm tra có phải auth route không
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased selection:bg-primary/30",
          inter.variable
        )}
      >
        {isAuthRoute ? (
          // Auth layout: không có Navigation
          <div className="min-h-screen flex items-center justify-center">
            {children}
          </div>
        ) : (
          // App layout: có Navigation
          <div className="relative flex min-h-screen flex-col md:flex-row bg-background">
            <Navigation />
            <div className="flex-1 overflow-x-hidden pb-20 md:pb-0">
              {children}
            </div>
          </div>
        )}
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}
