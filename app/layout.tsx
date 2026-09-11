import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CartSentry — Autonomous Cart Recovery",
  description:
    "An AI advisor proposes. A deterministic senate rules. CartSentry is an autonomous, guardrailed agent for abandoned-cart recovery.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
