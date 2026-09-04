import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SIA Elkaro — Vairumtirdzniecības portāls",
  description:
    "Vairumtirdzniecības portāls",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="lv" className={ `${poppins.variable} h-full antialiased` }>
      <body className="min-h-full flex flex-col">{ children }</body>
    </html>
  );
}
