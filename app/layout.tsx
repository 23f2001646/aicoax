import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "AiCoax — Your Mental Health Companion",
  description: "Evidence-based mental health support, psychoeducation, and behavioral change tools — powered by AI, guided by ethics.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "AiCoax" },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${geist.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <body className="min-h-full text-white" style={{ background: "transparent" }}>
        <AppProviders>{children}</AppProviders>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
              window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
            } else {
              // Unregister any stale SW in dev to prevent stale cache issues
              navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
            }
          }
        `}} />
      </body>
    </html>
  );
}
