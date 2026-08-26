import type { Metadata } from "next";
import { Geist_Mono, Kalam, Poppins } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { AuthProvider } from "@/lib/authContext";
import { SelectedDateProvider } from "@/lib/selectedDateContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

export const metadata: Metadata = {
  title: "Khata",
  description: "A simple daily expense tracker",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} ${kalam.variable} h-full antialiased`}
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
