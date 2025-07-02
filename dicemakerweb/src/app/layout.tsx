import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polyhedral Dice Maker - Custom 3D Dice Designer",
  description: "Create custom polyhedral dice with text and graphics. Export 3D-printable STL files for D4, D6, D8, D10, D12, and D20 dice.",
  keywords: "dice, 3D printing, STL, polyhedral, custom dice, tabletop games, D&D, RPG",
  authors: [{ name: "Dice Maker Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
