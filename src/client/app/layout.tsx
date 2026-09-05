import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { SiteCookieBanner } from "@/components/features/site/SiteCookieBanner";
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
      <body className="min-h-full flex flex-col">
        { children }
        <SiteCookieBanner
          policyHref="/privatuma-politika"
          categories={ [
            { id: "nepieciesamas", label: "Nepieciešamās", locked: true, defaultChecked: true, description: "Sesija, groza saturs un drošība. Bez tām veikals nedarbojas." },
            { id: "analitika", label: "Analītika", defaultChecked: true, description: "Anonīma statistika par to, kā katalogs tiek lietots." },
            { id: "marketings", label: "Mārketings", defaultChecked: false, description: "Piedāvājumu personalizācija un remārketings." },
          ] }
          labels={ {
            regionLabel: "Sīkdatņu paziņojums",
            title: "Sīkdatnes šajā vietnē",
            policyLinkLabel: "privātuma politikā",
            lockedSuffix: " · vienmēr ieslēgtas",
            settingsLabel: "Iestatījumi",
            saveLabel: "Saglabāt izvēli",
            necessaryOnlyLabel: "Tikai nepieciešamās",
            acceptAllLabel: "Piekrītu",
          } }
          bodyBeforeLink="Izmantojam sīkdatnes, lai veikals darbotos un lai saprastu, kā tas tiek lietots. Vairāk lasiet "
          bodyAfterLink="."
        />
      </body>
    </html>
  );
}
