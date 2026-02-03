import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechVedyaa | Intelligent Automation & AI Marketing",
  description: "Empowering businesses with intelligent automation, AI-driven marketing solutions, and seamless digital transformation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <script dangerouslySetInnerHTML={{ __html: `console.log('Deployment Version: v2.0 - Cache Busting Active');` }} />
        <NavBar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
