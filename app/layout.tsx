import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LineaBlu Legal Impact Score",
  description: "Assess your legal function's operational maturity and strategic impact",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
