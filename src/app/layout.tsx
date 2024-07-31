import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppStateProvider from "@/lib/providers/state-provider";
import db from "@/lib/supabase/db";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/providers/next-theme-provider";
import { SupabaseUserProvider } from "@/lib/providers/supabase-user-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" enableSystem defaultTheme="system">
          <AppStateProvider>
            <SupabaseUserProvider>{children}</SupabaseUserProvider>
            <Toaster />
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
