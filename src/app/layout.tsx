import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Community Events Board",
    template: "%s | Community Events Board",
  },
  description:
    "Discover local community events near you — music, workshops, food fairs, sports, and kids activities.",
  keywords: ["community events", "local events", "India events", "things to do"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--color-bg-page)" }}>
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold"
          style={{
            backgroundColor: "var(--color-accent-primary)",
            color: "var(--color-text-inverse)",
          }}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
