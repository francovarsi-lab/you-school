import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "YOU SCHOOL", template: "%s · YOU SCHOOL" },
  description: "Educación gratuita y abierta, empezando por Argentina",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t border-gray-400 bg-white px-4 py-3 text-center">
          <Link
            href="/creditos"
            className="inline-flex min-h-11 items-center px-4 text-gray-900 underline underline-offset-4 hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 rounded-sm"
          >
            Créditos
          </Link>
        </footer>
      </body>
    </html>
  );
}
