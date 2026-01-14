import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LineaBlu Legal Value Score™ - Discover Your Untapped Potential",
  description: "Find out how much value is waiting in your legal function. Most businesses discover €200K-€500K in untapped opportunities. Takes 5 minutes.",
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
