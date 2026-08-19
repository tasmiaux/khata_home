import type { Metadata } from "next";
import { Geist, Geist_Mono, Kalam, Lora } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { AuthProvider } from "@/lib/authContext";
import { SelectedDateProvider } from "@/lib/selectedDateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin", "devanagari"],
  weight: ["400", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Khata",
  description: "A simple daily expense tracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${kalam.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AuthProvider>
          <SelectedDateProvider>
            <TopBar />
            <div className="flex flex-1 flex-col pb-24">{children}</div>
            <BottomNav />
          </SelectedDateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
