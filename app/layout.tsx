import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/PWA";

export const metadata: Metadata = {
  title: "Presently",
  description: "Club attendance PWA",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Presently",
    statusBarStyle: "black-translucent",
  }
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegister />
        <div className="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
