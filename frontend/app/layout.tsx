import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { TopHeader } from "@/components/layout/TopHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SentrySearch UI",
  description: "Semantic search for dashcam footage",
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden text-foreground bg-background`}>
        <Providers>
          <TooltipProvider>
            <SidebarNav />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <TopHeader />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
