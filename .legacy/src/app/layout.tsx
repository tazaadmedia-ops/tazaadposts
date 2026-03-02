import type { Metadata, Viewport } from "next";
import { Lateef } from "next/font/google";
import "./globals.css";

const lateef = Lateef({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["arabic", "latin"],
  variable: "--font-lateef",
});

export const metadata: Metadata = {
  title: "Tazaad Post Designer",
  description: "Create social media news posts for Tazaad",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lateef.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
