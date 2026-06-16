import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WordRoom — Сөздерді тақырып бойынша жатта",
  description:
    "Сөздерді тақырып бойынша енгізіп, ойын режимдері арқылы жатта. Тіркелусіз, тек атыңызбен.",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk">
      <body>{children}</body>
    </html>
  );
}
