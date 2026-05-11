import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "PreMoney — Venture Simulator",
  description:
    "Simulate venture financing rounds, cap tables, and exit waterfalls. Understand how fundraising, dilution, and term sheets affect founders, investors, and employees.",
  openGraph: {
    title: "PreMoney — Venture Simulator",
    description:
      "Simulate venture financing rounds, cap tables, and exit waterfalls.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={300}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </TooltipProvider>
      </body>
    </html>
  );
}
